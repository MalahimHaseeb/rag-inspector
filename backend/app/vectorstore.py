import chromadb
from app.config import settings

client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
collection = client.get_or_create_collection(name="documents")

def add_chunks(doc_id: str, chunks: list):
    ids = [f"{doc_id}-{i}" for i in range(len(chunks))]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {"doc_id": doc_id, "start_offset": c["start_offset"], "end_offset": c["end_offset"]}
        for c in chunks
    ]
    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    return ids

def list_documents():
    all_items = collection.get()
    doc_map = {}
    for metadata in all_items["metadatas"]:
        doc_id = metadata["doc_id"]
        doc_map[doc_id] = doc_map.get(doc_id, 0) + 1
    return [{"doc_id": doc_id, "chunk_count": count} for doc_id, count in doc_map.items()]

def get_document_chunks(doc_id: str):
    results = collection.get(where={"doc_id": doc_id})
    chunks = []
    for i in range(len(results["ids"])):
        chunks.append({
            "text": results["documents"][i],
            "start_offset": results["metadatas"][i]["start_offset"],
            "end_offset": results["metadatas"][i]["end_offset"],
            "length": len(results["documents"][i])
        })
    return chunks

def delete_document(doc_id: str):
    collection.delete(where={"doc_id": doc_id})

def clear_collection():
    global collection
    client.delete_collection(name="documents")
    collection = client.get_or_create_collection(name="documents")

def query_chunks(query: str, top_k: int = 4):
    results = collection.query(query_texts=[query], n_results=top_k)
    retrieved = []
    for i in range(len(results["ids"][0])):
        retrieved.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i]
        })
    return retrieved