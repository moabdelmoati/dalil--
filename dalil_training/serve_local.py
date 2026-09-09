#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
serve_local.py
==============
تشغيل موديل دليل القانوني المدرب محلياً عبر API سريع (FastAPI).
يستمع على http://localhost:8000
"""

import sys
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

BASE_MODEL_ID = "unsloth/Llama-3.2-1B-Instruct"
LORA_PATH = "dalil-legal-lora"
PORT = 8000

app = FastAPI(title="Dalil Local Legal AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
tokenizer = None

SYSTEM_PROMPT = """أنت دليل، مساعد قانوني ذكي متخصص في القانون المصري.
مهمتك الإجابة على الأسئلة القانونية بدقة ووضوح استناداً إلى التشريعات والقوانين المصرية المعتمدة."""

class AskRequest(BaseModel):
    question: str
    documentText: Optional[str] = ""
    history: Optional[List[dict]] = []

class AskResponse(BaseModel):
    answer: str
    model: str = "dalil-legal-lora"

@app.on_event("startup")
def load_model():
    global model, tokenizer
    print(f"📥 جاري تحميل التوكنزر والموديل: {BASE_MODEL_ID}...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    print("🧠 تحميل الموديل الأساسي بترميز 4-bit...")
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
        torch_dtype=torch.float16,
        trust_remote_code=True,
    )

    print(f"🔧 دمج أوزان LoRA من: {LORA_PATH}...")
    try:
        model = PeftModel.from_pretrained(base_model, LORA_PATH)
        print("✅ تم دمج أوزان LoRA بنجاح!")
    except Exception as e:
        print(f"⚠️ تعذر تحميل LoRA ({e}) - سيتم استخدام الموديل الأساسي.")
        model = base_model

    model.eval()
    print(f"🚀 خادم الموديل القانوني جاهز على: http://localhost:{PORT}")

@app.get("/health")
def health():
    gpu = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    return {"status": "ok", "device": gpu, "model": LORA_PATH}

@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    if not model or not tokenizer:
        raise HTTPException(status_code=503, detail="الموديل ما زال قيد التحميل...")

    user_content = req.question
    if req.documentText:
        user_content = f"المستند القانوني:\n{req.documentText}\n\nالسؤال: {req.question}"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    if req.history:
        for msg in req.history[-6:]:
            role = "assistant" if msg.get("role") in ["assistant", "model"] else "user"
            messages.append({"role": role, "content": msg.get("text") or msg.get("content", "")})

    messages.append({"role": "user", "content": user_content})

    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=400,
            temperature=0.3,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )

    answer = tokenizer.decode(output_ids[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
    return AskResponse(answer=answer.strip())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
