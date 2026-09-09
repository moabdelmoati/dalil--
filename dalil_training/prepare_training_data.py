import sys
sys.stdout.reconfigure(encoding='utf-8-sig', errors='replace')
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prepare_training_data.py
========================
يجهّز ملف training_data.jsonl لتدريب موديل دليل القانوني المصري.

يقرأ ملفات القوانين من laws_data/ ويولّد أمثلة تدريب بصيغة:
  {"instruction": "...", "input": "", "output": "..."}

الخطوات:
  1. يقرأ كل ملف JSON في مجلد القوانين
  2. يولّد أسئلة متنوعة عن كل مادة قانونية
  3. يضيف معرفة خدمات دليل (مكررة x15 لضمان الحفظ)
  4. يكتب الناتج في training_data.jsonl
"""

import json
import os
import random

# ============================
#  ← عدّل هذا المسار ليطابق مكان فولدر laws_data عندك
# ============================
LAWS_DIR = "../ss/laws_data"
SERVICES_FILE = "services_knowledge.json"
OUTPUT_FILE = "training_data.jsonl"

# عدد مرات تكرار معرفة الخدمات لضمان حفظها وسط آلاف أمثلة القانون
SERVICES_REPEAT = 15

# ============================
# قوالب الأسئلة - متنوعة لتعطي الموديل مرونة
# ============================
ARTICLE_QUESTION_TEMPLATES = [
    "ما هو نص {article} من {law_name}؟",
    "ما هي أحكام {article} في {law_name}؟",
    "اشرح {article} من {law_name}.",
    "ماذا تقول {article} في {law_name}؟",
    "ما العقوبة المنصوص عليها في {article} من {law_name}؟",
    "ما الحقوق المكفولة بموجب {article} من {law_name}؟",
    "ما الالتزامات المذكورة في {article} من {law_name}؟",
    "فسّر لي {article} من {law_name} بلغة بسيطة.",
    "ما مضمون {article} من {law_name}؟",
    "تكلم عن {article} في قانون {law_name}.",
]

LAW_OVERVIEW_TEMPLATES = [
    "ما هو {law_name}؟",
    "تكلم عن {law_name}.",
    "اشرح لي {law_name} باختصار.",
    "ما أهم أحكام {law_name}؟",
    "ما الموضوعات التي يتناولها {law_name}؟",
]

PREAMBLE_QUESTION_TEMPLATES = [
    "ما هي ديباجة {law_name}؟",
    "ما المبادئ الأساسية التي يقوم عليها {law_name}؟",
    "اشرح مقدمة {law_name}.",
]

# ============================
# دوال مساعدة
# ============================

def load_json_file(path: str) -> dict:
    """يقرأ ملف JSON بترميز UTF-8."""
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)

def write_jsonl(examples: list, output_path: str):
    """يكتب قائمة الأمثلة كملف JSONL."""
    with open(output_path, "w", encoding="utf-8-sig") as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    print(f"[OK] تم حفظ {len(examples)} مثال في: {output_path}")

def make_example(instruction: str, output: str) -> dict:
    """ينشئ مثال تدريب بالصيغة المطلوبة."""
    return {
        "instruction": instruction.strip(),
        "input": "",
        "output": output.strip(),
    }

def truncate_text(text: str, max_chars: int = 2000) -> str:
    """يقلّص النص لحد أقصى لتجنب التسلسلات الطويلة جداً."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "..."

# ============================
# توليد أمثلة من القوانين
# ============================

def generate_law_examples(law_data: dict) -> list:
    """يولّد أمثلة تدريب من ملف قانون واحد."""
    examples = []
    law_name = law_data.get("law_name", "القانون")
    articles = law_data.get("articles", [])
    preamble = law_data.get("preamble", "")
    raw_text = law_data.get("raw_text", "")

    # 1) أسئلة نظرة عامة على القانون
    overview_text = preamble if preamble else raw_text
    if overview_text:
        overview_text = truncate_text(overview_text, 1500)
        for template in random.sample(LAW_OVERVIEW_TEMPLATES, min(2, len(LAW_OVERVIEW_TEMPLATES))):
            q = template.format(law_name=law_name)
            answer = f"{overview_text}"
            examples.append(make_example(q, answer))

    # 2) أسئلة عن الديباجة
    if preamble and len(preamble) > 100:
        for template in random.sample(PREAMBLE_QUESTION_TEMPLATES, min(1, len(PREAMBLE_QUESTION_TEMPLATES))):
            q = template.format(law_name=law_name)
            answer = truncate_text(preamble, 1500)
            examples.append(make_example(q, answer))

    # 3) أسئلة عن كل مادة
    for article_obj in articles:
        article_num = article_obj.get("article", "").strip()
        article_text = article_obj.get("text", "").strip()

        if not article_num or not article_text:
            continue

        # اختر 2-3 قوالب عشوائية لكل مادة (لتنويع الأسئلة)
        selected_templates = random.sample(
            ARTICLE_QUESTION_TEMPLATES,
            min(3, len(ARTICLE_QUESTION_TEMPLATES))
        )

        for template in selected_templates:
            q = template.format(article=article_num, law_name=law_name)
            answer = f"نص {article_num} من {law_name}:\n\n{truncate_text(article_text, 1800)}"
            examples.append(make_example(q, answer))

        # سؤال باستخدام النص الخام للمادة كـ input (اختياري - يزيد التنوع)
        if len(article_text) > 200:
            examples.append(make_example(
                f"ما {article_num} من {law_name}؟",
                f"{article_text}"
            ))

    return examples

# ============================
# توليد أمثلة خدمات دليل
# ============================

def generate_services_examples(services_data: dict, repeat: int = 15) -> list:
    """يولّد أمثلة تدريب عن خدمات دليل ويكررها."""
    raw_examples = []
    qa_list = services_data.get("qa_examples", [])

    for qa in qa_list:
        raw_examples.append(make_example(qa["question"], qa["answer"]))

    # أسئلة إضافية عن الخدمات
    services = services_data.get("services", [])
    app_name = services_data.get("app_name", "دليل")
    covered_laws = services_data.get("covered_laws", [])

    for svc in services:
        raw_examples.append(make_example(
            f"ما خدمة {svc['name']} في {app_name}؟",
            f"{svc['description']}\n\n{svc['details']}"
        ))
        raw_examples.append(make_example(
            f"كيف يساعدني {app_name} في {svc['name']}؟",
            f"{svc['details']}"
        ))

    # سؤال عن القوانين المشمولة
    if covered_laws:
        laws_str = "، ".join(covered_laws)
        raw_examples.append(make_example(
            f"ما القوانين التي يعرفها {app_name}؟",
            f"يغطي {app_name} القوانين المصرية التالية:\n" + "\n".join(f"- {l}" for l in covered_laws)
        ))
        raw_examples.append(make_example(
            f"هل {app_name} يعرف قانون العقوبات؟",
            f"نعم، {app_name} يغطي قانون العقوبات المصري وكثيراً من القوانين المصرية الأخرى مثل: {laws_str}."
        ))

    # كرر الأمثلة لضمان الحفظ
    repeated = raw_examples * repeat
    random.shuffle(repeated)
    print(f"  → معرفة الخدمات: {len(raw_examples)} مثال × {repeat} = {len(repeated)} مثال")
    return repeated

# ============================
# Main
# ============================

def main():
    print("=" * 60)
    print("[*] تجهيز بيانات تدريب موديل دليل")
    print("=" * 60)

    all_examples = []

    # --- تحميل وتوليد أمثلة القوانين ---
    laws_dir = os.path.abspath(LAWS_DIR)
    if not os.path.isdir(laws_dir):
        print(f"[ERROR] مجلد القوانين غير موجود: {laws_dir}")
        print("   عدّل متغير LAWS_DIR في بداية الملف.")
        return

    law_files = [f for f in os.listdir(laws_dir) if f.endswith(".json") and f != "_index.json"]
    print(f"\n[DIR] تم العثور على {len(law_files)} ملف قانون في: {laws_dir}")

    for i, fname in enumerate(law_files, 1):
        fpath = os.path.join(laws_dir, fname)
        try:
            law_data = load_json_file(fpath)
            law_name = law_data.get("law_name", fname)
            examples = generate_law_examples(law_data)
            all_examples.extend(examples)
            print(f"  [{i:02d}/{len(law_files)}] {law_name}: {len(examples)} مثال")
        except Exception as e:
            print(f"  [WARN] خطأ في {fname}: {e}")

    print(f"\n[STATS] مجموع أمثلة القوانين: {len(all_examples)}")

    # --- تحميل وتوليد أمثلة الخدمات ---
    services_path = os.path.abspath(SERVICES_FILE)
    if os.path.isfile(services_path):
        print(f"\n[CONFIG] تحميل معرفة الخدمات من: {services_path}")
        services_data = load_json_file(services_path)
        services_examples = generate_services_examples(services_data, repeat=SERVICES_REPEAT)
        all_examples.extend(services_examples)
    else:
        print(f"\n[WARN] ملف الخدمات غير موجود: {services_path}")
        print("   سيتم المتابعة بدون أمثلة الخدمات.")

    # --- خلط وحفظ ---
    random.shuffle(all_examples)
    print(f"\n[OK] إجمالي الأمثلة بعد الخلط: {len(all_examples)}")

    output_path = os.path.abspath(OUTPUT_FILE)
    write_jsonl(all_examples, output_path)

    print("\n" + "=" * 60)
    print("[DONE] اكتملت عملية تجهيز البيانات!")
    print(f"   الملف: {output_path}")
    print(f"   عدد الأمثلة: {len(all_examples)}")
    if len(all_examples) > 50000:
        print("   [WARN]  الملف كبير جداً (+50k سطر) → قلّل num_train_epochs في train_lora.py لـ 1 أو 2")
    print("=" * 60)


if __name__ == "__main__":
    random.seed(42)
    main()


