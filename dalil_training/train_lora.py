import sys
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
train_lora.py
=============
سكريبت تدريب موديل دليل القانوني بتقنية LoRA باستخدام Unsloth.

⚠️  شغّل هذا السكريبت على Google Colab مع GPU (T4 أو A100)
    لا يعمل على CPU - يحتاج CUDA GPU.

الخطوات:
  1. pip install unsloth -q
  2. python train_lora.py

المخرجات:
  - dalil-legal-lora/   : LoRA adapters (صغيرة - كام ميجا)
  - dalil-legal-gguf/   : نسخة GGUF للاستخدام مع Ollama (اختياري)
"""

import json
import os
import torch

# ============================
# إعدادات التدريب - عدّلها حسب احتياجك
# ============================
CONFIG = {
    # الموديل الأساسي - يمكن تغييره لأي موديل Llama/Mistral/Qwen
    "base_model": "unsloth/Llama-3.2-3B-Instruct",

    # ملف بيانات التدريب
    "data_file": "training_data.jsonl",

    # مجلد حفظ الموديل المدرب
    "output_dir": "dalil-legal-lora",

    # إعدادات LoRA
    "lora_r": 16,           # رتبة LoRA (16 = توازن بين الجودة والسرعة)
    "lora_alpha": 32,       # alpha = r * 2 عادةً
    "lora_dropout": 0.05,

    # إعدادات التدريب
    "max_seq_length": 2048,
    "num_train_epochs": 3,   # قلّلها لـ 1 أو 2 لو الداتا +50k
    "per_device_train_batch_size": 4,
    "gradient_accumulation_steps": 4,
    "learning_rate": 2e-4,
    "warmup_ratio": 0.05,
    "weight_decay": 0.01,
    "lr_scheduler_type": "cosine",

    # حفظ نقاط تفتيش أثناء التدريب
    "save_steps": 500,
    "logging_steps": 50,

    # تحويل لـ GGUF بعد التدريب (True = يحمل الملف - يأخذ وقت إضافي)
    "save_gguf": True,
    "gguf_method": "q4_k_m",     # الجودة: q4_k_m = جيد، q8_0 = أفضل لكن أكبر
    "gguf_output_dir": "dalil-legal-gguf",
}

# ============================
# نموذج المحادثة (Prompt Template)
# ============================
SYSTEM_PROMPT = """أنت دليل، مساعد قانوني ذكي متخصص في القانون المصري.
مهمتك الإجابة على الأسئلة القانونية بدقة وبلغة عربية واضحة، استناداً إلى نصوص القوانين المصرية.
لا تتجاهل السؤال ولا تخترع إجابات - إذا لم تعرف، قل ذلك بصراحة."""

def format_prompt(instruction: str, input_text: str, output: str, tokenizer) -> str:
    """يحوّل مثال التدريب لصيغة chat قابلة للتوكنة."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": instruction if not input_text else f"{instruction}\n\n{input_text}"},
        {"role": "assistant", "content": output},
    ]
    return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)

def load_dataset(data_file: str, tokenizer, max_seq_length: int):
    """يحمّل ملف JSONL ويحوّله لـ Dataset."""
    from datasets import Dataset

    examples = []
    skipped = 0

    with open(data_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            text = format_prompt(
                obj.get("instruction", ""),
                obj.get("input", ""),
                obj.get("output", ""),
                tokenizer,
            )
            # تجاهل الأمثلة الطويلة جداً
            tokens = tokenizer(text, return_tensors="pt")
            if tokens["input_ids"].shape[1] > max_seq_length:
                skipped += 1
                continue
            examples.append({"text": text})

    print(f"  → تم تحميل {len(examples)} مثال (تجاهل {skipped} طويل)")
    return Dataset.from_list(examples)

def main():
    print("=" * 60)
    print("🚀 بدء تدريب موديل دليل القانوني")
    print("=" * 60)

    # تحقق من GPU
    if not torch.cuda.is_available():
        print("❌ لم يتم الكشف عن GPU!")
        print("   شغّل هذا السكريبت على Google Colab مع T4 GPU")
        return

    gpu_name = torch.cuda.get_device_name(0)
    gpu_mem = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"✅ GPU: {gpu_name} ({gpu_mem:.1f} GB)")

    # ===== تحميل الموديل =====
    print(f"\n📥 تحميل الموديل: {CONFIG['base_model']}")
    from unsloth import FastLanguageModel

    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=CONFIG["base_model"],
        max_seq_length=CONFIG["max_seq_length"],
        dtype=None,          # auto-detect
        load_in_4bit=True,   # توفير ذاكرة GPU
    )

    # ===== تطبيق LoRA =====
    print("\n🔧 تطبيق LoRA adapters...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=CONFIG["lora_r"],
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                        "gate_proj", "up_proj", "down_proj"],
        lora_alpha=CONFIG["lora_alpha"],
        lora_dropout=CONFIG["lora_dropout"],
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
        use_rslora=False,
        loftq_config=None,
    )

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  → إجمالي المعاملات: {total_params/1e6:.1f}M")
    print(f"  → معاملات قابلة للتدريب: {trainable_params/1e6:.2f}M ({100*trainable_params/total_params:.2f}%)")

    # ===== تحميل البيانات =====
    data_file = CONFIG["data_file"]
    if not os.path.isfile(data_file):
        print(f"\n❌ ملف البيانات غير موجود: {data_file}")
        print("   شغّل prepare_training_data.py أولاً وارفع training_data.jsonl لـ Colab")
        return

    print(f"\n📂 تحميل بيانات التدريب من: {data_file}")
    dataset = load_dataset(data_file, tokenizer, CONFIG["max_seq_length"])

    # ===== إعداد المدرب =====
    print("\n⚙️ إعداد مدرب SFT...")
    from trl import SFTTrainer
    from transformers import TrainingArguments

    training_args = TrainingArguments(
        output_dir=CONFIG["output_dir"],
        num_train_epochs=CONFIG["num_train_epochs"],
        per_device_train_batch_size=CONFIG["per_device_train_batch_size"],
        gradient_accumulation_steps=CONFIG["gradient_accumulation_steps"],
        learning_rate=CONFIG["learning_rate"],
        warmup_ratio=CONFIG["warmup_ratio"],
        weight_decay=CONFIG["weight_decay"],
        lr_scheduler_type=CONFIG["lr_scheduler_type"],
        save_steps=CONFIG["save_steps"],
        logging_steps=CONFIG["logging_steps"],
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        optim="adamw_8bit",
        seed=42,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=CONFIG["max_seq_length"],
        dataset_num_proc=2,
        packing=False,        # يجمع أمثلة قصيرة معاً لتوفير الوقت
        args=training_args,
    )

    # ===== التدريب =====
    print("\n🏋️ بدء التدريب...")
    print(f"  الأمثلة: {len(dataset)}")
    print(f"  Epochs: {CONFIG['num_train_epochs']}")
    print(f"  Batch size: {CONFIG['per_device_train_batch_size']} × {CONFIG['gradient_accumulation_steps']} = {CONFIG['per_device_train_batch_size']*CONFIG['gradient_accumulation_steps']}")
    print("-" * 40)

    trainer.train()

    # ===== حفظ الموديل =====
    print(f"\n💾 حفظ LoRA adapters في: {CONFIG['output_dir']}/")
    model.save_pretrained(CONFIG["output_dir"])
    tokenizer.save_pretrained(CONFIG["output_dir"])
    print("✅ تم حفظ LoRA adapters")

    # ===== تحويل لـ GGUF (اختياري) =====
    if CONFIG["save_gguf"]:
        print(f"\n🔄 تحويل لصيغة GGUF ({CONFIG['gguf_method']})...")
        print("   هذا قد يأخذ عدة دقائق...")
        model.save_pretrained_gguf(
            CONFIG["gguf_output_dir"],
            tokenizer,
            quantization_method=CONFIG["gguf_method"],
        )
        print(f"✅ تم حفظ GGUF في: {CONFIG['gguf_output_dir']}/")

    print("\n" + "=" * 60)
    print("🎉 اكتمل التدريب بنجاح!")
    print(f"  LoRA adapters: {CONFIG['output_dir']}/")
    if CONFIG["save_gguf"]:
        print(f"  GGUF (Ollama): {CONFIG['gguf_output_dir']}/")
    print("\nلاستخدام الموديل:")
    print("  from unsloth import FastLanguageModel")
    print(f"  model, tokenizer = FastLanguageModel.from_pretrained('{CONFIG['output_dir']}')")
    print("  FastLanguageModel.for_inference(model)")
    print("=" * 60)


if __name__ == "__main__":
    main()

