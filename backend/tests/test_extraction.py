import pytest
from app.extraction import extract_text

def test_extract_txt():
    content = b"hello world"
    result = extract_text("notes.txt", content)
    assert result == "hello world"

def test_extract_md():
    content = b"# heading\n\nsome text"
    result = extract_text("notes.md", content)
    assert "heading" in result

def test_extract_unsupported_type_raises():
    with pytest.raises(ValueError):
        extract_text("image.png", b"binarydata")

def test_extract_no_extension_raises():
    with pytest.raises(ValueError):
        extract_text("noextension", b"data")