# دليل تدريب موديل "دليل" القانوني (Dalil Legal LoRA)

تم إعداد وتجهيز ملفات التدريب بنجاح داخل هذا المجلد (`dalil_training`):

## 📁 محتويات المجلد:
1. `prepare_training_data.py`: سكريبت تجهيز ومعالجة القوانين وتحويلها لبيانات تدريب.
2. `services_knowledge.json`: بنك معرفة خدمات وتفاصيل منصة "دليل" (مكرر بنسبة x15).
3. `training_data.jsonl`: ملف بيانات التدريب الجاهز (1,222 مثال تدريبي متكامل).
4. `train_lora.py`: سكريبت التدريب باستخدام Unsloth و LoRA و Llama-3.2-3B.

---

## 🚀 خطوات التشغيل على Google Colab (خطوة بخطوة):

### 1️⃣ فتح بيئة Colab وضبط كرت الشاشة:
- افتح الرابط: [Google Colab](https://colab.research.google.com)
- أنشئ دفتر ملاحظات جديد (New Notebook).
- من القائمة العلوية: **Runtime** ➔ **Change runtime type**.
- اختر **T4 GPU** ثم اضغط **Save**.

### 2️⃣ رفع ملفات التدريب:
- اضغط على أيقونة المجلد 📁 في القائمة الجانبية اليسرى في Colab.
- اسحب وأفلت الملفين التاليين من مجلد `dalil_training`:
  - `train_lora.py`
  - `training_data.jsonl`

### 3️⃣ تثبيت المكتبات وتشغيل التدريب:
في أول خلية في Colab، ضع الكود التالي وشغّله:

```python
# تثبيت Unsloth والمكتبات اللازمة لتدريب LoRA السريع
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git" -q
!pip install --no-deps trl peft accelerate bitsandbytes -q

# تشغيل التدريب
!python train_lora.py
```

---

## ⏱️ وقت التدريب والمخرجات:
- **وقت التدريب:** يستغرق حوالي 15 إلى 30 دقيقة على كرت T4 المجاني (لـ 1,222 مثال).
- **المخرجات بعد التدريب:**
  1. مجلد `dalil-legal-lora/`: ملفات أوزان LoRA (حجم صغير، بضع عشرات من الميجابايت).
  2. مجلد `dalil-legal-gguf/`: ملف بصيغة GGUF جاهز للتشغيل محلياً عبر **Ollama** أو **LM Studio**.

---

## 💻 تجربة الموديل بعد التدريب داخل Colab:
في خلية جديدة بعد انتهاء التدريب:

```python
from unsloth import FastLanguageModel

# تحميل الموديل المدرب
model, tokenizer = FastLanguageModel.from_pretrained("dalil-legal-lora")
FastLanguageModel.for_inference(model)

# تجربة سؤال
prompt = """أنت دليل، مساعد قانوني ذكي متخصص في القانون المصري.
User: ما هي عقوبة الرشوة في قانون العقوبات المصري؟
Assistant:"""

inputs = tokenizer([prompt], return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=256, use_cache=True)
print(tokenizer.batch_decode(outputs)[0])
```
