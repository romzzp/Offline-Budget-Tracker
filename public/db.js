let db;
// this creates a new db request for the "BudgetDB"
const request = window.indexedDB.open("BudgetDB", 1);

// this creates an objectstore with auto increment set to true
request.onupgradeneeded = ({ target }) => {
    const db = target.result
    db.createObjectStore("BudgetStore", { autoIncrement: true });
}
request.onsuccess = (event) => {
    db = event.target.result;
    //checks if the navigator is online
    if (navigator.onLine) {
        checkDatabase();
    }
}
request.onerror = (event) => {
    console.log(event.target.errorCode)
}
//added function to save the record
function saveRecord(record) {
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    const BudgetStore = transaction.objectStore("BudgetStore");
    BudgetStore.add(record);
}
//function to check database
function checkDatabase() {
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    const pending = transaction.objectStore("BudgetStore");
    const getAll = pending.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["BudgetStore"], "readwrite");
                    const store = transaction.objectStore("BudgetStore");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase);