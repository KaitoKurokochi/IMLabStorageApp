import asyncio
from app.main import app
from app.database import db

async def test_backend():
    print("Initializing DB...")
    await db.connect()
    
    shelves = await db.get_shelves()
    print(f"Shelves count: {len(shelves)}")
    assert len(shelves) == 9, "Expected 9 shelves (A-1 to C-3)"

    items = await db.get_items()
    print(f"Items count: {len(items)}")
    assert len(items) >= 6, "Expected at least 6 initial items"

    users = await db.get_users()
    print(f"Users count: {len(users)}")
    assert len(users) >= 3, "Expected at least 3 initial users"

    # Test borrow
    test_user = users[0]
    test_item = [i for i in items if i["status"] == "available"][0]
    print(f"Borrowing {test_item['name']} by {test_user['name']}...")
    borrowed = await db.borrow_item(test_item["id"], test_user["id"], test_user["name"])
    assert borrowed["status"] == "in_use"

    # Test return
    print(f"Returning {test_item['name']}...")
    returned = await db.return_item(test_item["id"], test_user["id"], test_user["name"])
    assert returned["status"] == "available"

    # Check logs
    logs = await db.get_logs()
    print(f"Logs count: {len(logs)}")
    assert len(logs) >= 2

    # Test image storage in MongoDB
    print("Testing image storage in database...")
    sample_bytes = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
    img_id = await db.save_image(sample_bytes, content_type="image/gif", filename="test.gif")
    assert img_id.startswith("img-"), f"Invalid img_id: {img_id}"
    fetched = await db.get_image(img_id)
    assert fetched is not None
    fetched_data, fetched_type = fetched
    assert fetched_data == sample_bytes
    assert fetched_type == "image/gif"
    print(f"Image stored & retrieved successfully: {img_id}")

    print(" ALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_backend())

