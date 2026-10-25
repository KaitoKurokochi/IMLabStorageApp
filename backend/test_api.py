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

    print(" ALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_backend())

