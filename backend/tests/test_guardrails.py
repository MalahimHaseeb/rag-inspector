import pytest
from fastapi import HTTPException
from app.guardrails import validate_file, validate_query, validate_top_k, check_grounding, MAX_QUERY_LENGTH, MAX_TOP_K

def test_validate_file_rejects_no_extension():
    with pytest.raises(HTTPException) as exc:
        validate_file("noext", b"data")
    assert exc.value.status_code == 400

def test_validate_file_rejects_unsupported_extension():
    with pytest.raises(HTTPException):
        validate_file("image.png", b"data")

def test_validate_file_rejects_empty_content():
    with pytest.raises(HTTPException):
        validate_file("notes.txt", b"")

def test_validate_file_accepts_valid_txt():
    validate_file("notes.txt", b"some content")

def test_validate_query_rejects_empty():
    with pytest.raises(HTTPException):
        validate_query("")

def test_validate_query_rejects_whitespace_only():
    with pytest.raises(HTTPException):
        validate_query("   ")

def test_validate_query_rejects_too_long():
    with pytest.raises(HTTPException):
        validate_query("a" * (MAX_QUERY_LENGTH + 1))

def test_validate_query_accepts_normal_query():
    validate_query("What is the capital of France?")

def test_validate_top_k_rejects_zero():
    with pytest.raises(HTTPException):
        validate_top_k(0)

def test_validate_top_k_rejects_negative():
    with pytest.raises(HTTPException):
        validate_top_k(-1)

def test_validate_top_k_rejects_too_high():
    with pytest.raises(HTTPException):
        validate_top_k(MAX_TOP_K + 1)

def test_validate_top_k_accepts_normal_value():
    validate_top_k(4)

def test_check_grounding_flags_ungrounded_answer():
    chunks = [{"text": "Paris is the capital of France."}]
    result = check_grounding("Bananas are yellow and grow on trees.", chunks)
    assert result["grounded"] is False

def test_check_grounding_passes_grounded_answer():
    chunks = [{"text": "Paris is the capital of France and home to the Eiffel Tower."}]
    result = check_grounding("Paris is the capital of France.", chunks)
    assert result["grounded"] is True

def test_check_grounding_empty_answer_defaults_grounded():
    chunks = [{"text": "some context"}]
    result = check_grounding("", chunks)
    assert result["grounded"] is True