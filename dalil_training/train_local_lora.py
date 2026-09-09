#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
train_local_lora.py
===================
تدريب موديل دليل محلياً باستخدام كرت الشاشة RTX 4050 وتقنية QLoRA (4-bit مع BF16).
"""

import os
import sys
import json
import torch

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset
from trl import SFTTrainer, SFTConfig

# ============================
# الإعدادات
# ============================
MODEL_ID = "unsloth/Llama-3.2-1B-Instruct"
DATA_PATH = "training_data.jsonl"
OUTPUT_DIR = "dalil-legal-lora"
MAX_LENGTH = 1024
NUM_EPOCHS = 2
BATCH_SIZE = 2
GRAD_ACCUM = 4

SYSTEM_PROMPT = """أنت دليل، مساعد قانوني ذكي متخصص في القانون المصري.
مهمتك الإجابة على الأسئلة القانونية بدقة ووضوح استناداً إلى التشريعات والقوانين المصرية المعتمدة."""

def format_sample(instruction, input_text, output, tokenizer):
    user_msg = instruction if not input_text else f"{instruction}\n\n{input_text}"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
        {"role": "assistant", "content": output},
    ]
    return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)

def main():
    print("=" * 60)
    print("🚀 بدء تدريب موديل دليل القانوني محلياً على كرت الشاشة")
    print("=" * 60)

    if not torch.cuda.is_available():
        print("❌ لم يتم العثور على GPU متوافق مع CUDA!")
        sys.exit(1)

    gpu_name = torch.cuda.get_device_name(0)
    vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    print(f"✅ تم التعرف على GPU: {gpu_name} (VRAM: {vram:.2f} GB)")

    # 1. تحميل التوكنزر
    print(f"\n📥 تحميل Tokenizer من: {MODEL_ID}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 2. تجهيز البيانات
    print(f"\n📂 قراءة بيانات التدريب من: {DATA_PATH}")
    texts = []
    with open(DATA_PATH, "r", encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            item = json.loads(line)
            formatted = format_sample(
                item.get("instruction", ""),
                item.get("input", ""),
                item.get("output", ""),
                tokenizer
            )
            texts.append(formatted)

    dataset = Dataset.from_dict({"text": texts})
    print(f"✅ تم تحميل {len(dataset)} مثال تدريبي.")

    # 3. تحميل الموديل بترميز 4-bit مع BF16
    print(f"\n🧠 تحميل الموديل الأساسي بترميز 4-bit...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
        torch_dtype=torch.bfloat16,
        trust_remote_code=True,
    )
    model.config.use_cache = False
    model = prepare_model_for_kbit_training(model)

    # 4. إعداد طبقات LoRA
    print("\n🔧 تطبيق طبقات LoRA...")
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(model, peft_config)

    trainable_params, all_param = model.get_nb_trainable_parameters()
    print(f"📊 المعاملات القابلة للتدريب: {trainable_params:,} / {all_param:,} ({100 * trainable_params / all_param:.2f}%)")

    # 5. إعدادات التدريب مع BF16
    sft_config = SFTConfig(
        output_dir=OUTPUT_DIR,
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRAD_ACCUM,
        learning_rate=2e-4,
        warmup_steps=10,
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        logging_steps=20,
        save_strategy="epoch",
        bf16=True,
        fp16=False,
        optim="paged_adamw_8bit",
        report_to="none",
        gradient_checkpointing=True,
        dataset_text_field="text",
        max_length=MAX_LENGTH,
        packing=False,
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        processing_class=tokenizer,
        args=sft_config,
    )

    # 6. بدء التدريب
    print("\n" + "=" * 60)
    print("🏋️ بدء التدريب الفعلي على GPU (BF16)...")
    print(f"  • إجمالي الأمثلة: {len(dataset)}")
    print(f"  • عدد الـ Epochs: {NUM_EPOCHS}")
    print(f"  • حجم الدفعة الفعلي: {BATCH_SIZE * GRAD_ACCUM}")
    print("=" * 60)

    trainer.train()

    # 7. حفظ الأوزان الناتجة
    print(f"\n💾 حفظ أوزان LoRA في مجلد: {OUTPUT_DIR}...")
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("✅ تم حفظ الموديل بنجاح!")

    # 8. اختبار الموديل
    print("\n🧪 اختبار الموديل بعد التدريب...")
    test_question = "ما هو دليل وما هي خدماته القانونية؟"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": test_question}
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

    model.eval()
    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.3,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )

    response = tokenizer.decode(output_ids[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
    print("\n[السؤال]:", test_question)
    print("[إجابة الموديل المدرب]:\n", response.strip())
    print("\n🎉 انتهى التدريب بنجاح تام!")

if __name__ == "__main__":
    main()
