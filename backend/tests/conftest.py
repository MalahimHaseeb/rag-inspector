import os
import tempfile

os.environ["CHROMA_PERSIST_DIR"] = tempfile.mkdtemp(prefix="rag_inspector_test_")
os.environ.setdefault("OPENAI_API_KEY", "test-key-not-real")