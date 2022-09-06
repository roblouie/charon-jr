export function storeData(value: any) {
  const open = indexedDB.open("ddamt", 1);

// Create the schema
  open.onupgradeneeded = function () {
    const db = open.result;
    db.createObjectStore("ddamtStore", {keyPath: "id"});
  };

  open.onsuccess = function () {
    // Start a new transaction
    const db = open.result;
    const tx = db.transaction("ddamtStore", "readwrite");
    const store = tx.objectStore("ddamtStore");

    // Add some data
    store.put({id: 0, value});

    // Close the db when the transaction is done
    tx.oncomplete = function () {
      db.close();
    };
  }
}

export function getData(): Promise<any> {
  return new Promise((resolve, reject) => {


  const open = indexedDB.open("ddamt", 1);

// Create the schema
  open.onupgradeneeded = function () {
    const db = open.result;
    db.createObjectStore("ddamtStore", {keyPath: "id"});
  };

  open.onsuccess = function () {
    // Start a new transaction
    const db = open.result;
    const tx = db.transaction("ddamtStore", "readwrite");
    const store = tx.objectStore("ddamtStore");


    // Query the data
    const getNoiseCache = store.get(0);

    getNoiseCache.onsuccess = function () {
      resolve(getNoiseCache.result.value);
    };

    // Close the db when the transaction is done
    tx.oncomplete = function () {
      db.close();
    };
  }
  })
}
