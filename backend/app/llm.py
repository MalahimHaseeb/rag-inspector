import time
from openai import OpenAI
from app.config import settings

_client = None

def get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
    return _client

def build_prompt(query: str, chunks: list):
    context = "\n\n".join([f"[{i+1}] {c['text']}" for i, c in enumerate(chunks)])
    system_prompt = "Answer the question using only the provided context. If the context is insufficient, say so."
    user_prompt = f"Context:\n{context}\n\nQuestion: {query}"
    return system_prompt, user_prompt

def generate_answer(query: str, chunks: list):
    system_prompt, user_prompt = build_prompt(query, chunks)
    start = time.time()
    response = get_client().chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    latency_ms = round((time.time() - start) * 1000, 2)
    return {
        "answer": response.choices[0].message.content,
        "prompt": {"system": system_prompt, "user": user_prompt},
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        },
        "latency_ms": latency_ms,
        "model": settings.openai_model
    }