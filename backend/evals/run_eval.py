import json
import os
import sys
import tempfile

os.environ["CHROMA_PERSIST_DIR"] = tempfile.mkdtemp(prefix="rag_inspector_eval_")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.chunking import chunk_text
from app.vectorstore import add_chunks, query_chunks, clear_collection

def run_eval():
    clear_collection()

    eval_dir = os.path.dirname(__file__)
    with open(os.path.join(eval_dir, "reference_document.txt")) as f:
        document = f.read()
    with open(os.path.join(eval_dir, "golden_set.json")) as f:
        golden_set = json.load(f)

    chunks = chunk_text(document, chunk_size=300, overlap=30)
    add_chunks("eval-doc", chunks)

    results = []
    for case in golden_set:
        retrieved = query_chunks(case["question"], top_k=2)
        combined_text = " ".join(r["text"] for r in retrieved).lower()
        matched = [kw for kw in case["expected_keywords"] if kw.lower() in combined_text]
        recall = len(matched) / len(case["expected_keywords"])
        results.append({
            "question": case["question"],
            "expected_keywords": case["expected_keywords"],
            "matched_keywords": matched,
            "recall": recall,
            "passed": recall >= 0.5
        })

    return results

def print_report(results):
    passed_count = sum(1 for r in results if r["passed"])
    print(f"\nRetrieval Eval Report: {passed_count}/{len(results)} passed\n")
    print("-" * 60)
    for r in results:
        status = "PASS" if r["passed"] else "FAIL"
        print(f"[{status}] {r['question']}")
        print(f"  recall: {r['recall']:.2f}  matched: {r['matched_keywords']}")
    print("-" * 60)
    return passed_count == len(results)

if __name__ == "__main__":
    results = run_eval()
    all_passed = print_report(results)
    sys.exit(0 if all_passed else 1)