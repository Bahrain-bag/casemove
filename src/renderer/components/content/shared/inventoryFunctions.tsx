import itemCategories from './categories';
import axios from "axios"

// This will combine the inventory when specific conditions match
export default function combineInventory(thisInventory) {
  const seenProducts = [] as any;
  const newInventory = [] as any;

  for (const [, value] of Object.entries(thisInventory)) {
    let valued = value as String;

    // Create a string that matches the conditions
    let valueConditions =
      valued['item_name'] +
      valued['item_customname'] +
      valued['item_url'] +
      valued['trade_unlock'] +
      valued['item_moveable'] +
      valued['item_has_stickers'] +
      valued['stickers'];

    // Filter the inventory
    if (seenProducts.includes(valueConditions) == false) {
      length = thisInventory.filter(function (item) {
        let itemConditions =
          item['item_name'] +
          item['item_customname'] +
          item['item_url'] +
          item['trade_unlock'] +
          item['item_moveable'] +
          item['item_has_stickers'] +
          item['stickers'];

        return itemConditions == valueConditions;
      });

      // Get all ids
      let valuedList = [] as any;
      for (const [, filteredValue] of Object.entries(length)) {
        let filteredValued = filteredValue as String;

        valuedList.push(filteredValued['item_id']);
      }

      let newDict = length[0];
      newDict['combined_ids'] = valuedList;
      newDict['combined_QTY'] = valuedList.length;
      newInventory.push(newDict);

      // Push the seen conditions to avoid duplicates
      seenProducts.push(valueConditions);
    }
  }
  newInventory.forEach(function (item) {
    item['bgColorClass'] = 'bg-current';
    item['category'] = 'None';
    for (const [key, value] of Object.entries(itemCategories)) {
      key;
      if (item['item_url'].includes(value['value'])) {
        item['bgColorClass'] = value['bgColorClass'];
        item['category'] = value['name'];
      }
    }
  });

  return newInventory;
}

export async function getInventory(getInventoryData, prices, pricingSource) {
  var unfilteredInventory = await window.electron.ipcRenderer.runCommandTest(3);
  var combinedInventory = await combineInventory(unfilteredInventory);
  combinedInventory = await filterInventory(
    combinedInventory,
    getInventoryData['filters'],
    getInventoryData['sort'],
    prices,
    pricingSource
  );
  combinedInventory.forEach(function (item) {
    item['bgColorClass'] = 'bg-current';
    item['category'] = 'None';
    for (const [key, value] of Object.entries(itemCategories)) {
      key;
      if (item['item_url'].includes(value['value'])) {
        item['bgColorClass'] = value['bgColorClass'];
        item['category'] = value['name'];
      }
    }
  });
  return combinedInventory;
}

export async function getStorageUnitDataReload(storageID, storageName) {
  let storageResult = await window.electron.ipcRenderer.runCommandTest(
    2,
    [],
    storageID
  );
  storageResult = await combineInventory(storageResult);
  const newStorageData = [] as any;
  await storageResult.forEach(function (item) {
    item['bgColorClass'] = 'bg-current';
    item['category'] = 'None';
    for (const [, value] of Object.entries(itemCategories)) {
      if (item['item_url'].includes(value['value'])) {
        item['bgColorClass'] = value['bgColorClass'];
        item['category'] = value['name'];
      }
    }
    item['storage_id'] = storageID;
    item['storage_name'] = storageName;
    newStorageData.push(item);
  });

  return newStorageData;
}

export async function getStorageUnitData(storageID, storageName, prices, pricesRequested) {

  let newStorageData = [] as any;
  let productsToGet = [] as any;
  let storageResult = await window.electron.ipcRenderer.getStorageUnitData(
    storageID
  );
  storageResult = storageResult[1];

  storageResult = await combineInventory(storageResult);
  await storageResult.forEach(function (item) {
    item['bgColorClass'] = 'bg-current';
    item['category'] = 'None';
    for (const [, value] of Object.entries(itemCategories)) {
      if (item['item_url'].includes(value['value'])) {
        item['bgColorClass'] = value['bgColorClass'];
        item['category'] = value['name'];
      }
    }
    item['storage_id'] = storageID;
    item['storage_name'] = storageName;
    if (prices[item.item_name] == undefined && pricesRequested.includes(item.item_name) == false) {
      productsToGet.push(item)
    }
    newStorageData.push(item);

  });
  if (productsToGet.length > 0) {
    window.electron.ipcRenderer.getPrice(productsToGet)
  }
  return [newStorageData, productsToGet];
}

export async function filterInventory(
  combinedInventory,
  filtersData,
  sortData,
  prices,
  pricingSource
) {
  const thisInventory = [] as any;
  // First Categories
  let totalTwo = 0;
  console.log(filtersData)
  for (const [, value] of Object.entries(filtersData)) {
    let valued = value as String;
    let command = valued.substring(0, 1);
    valued = valued.substring(1);

    // Second filter
    if (command == '2') {
      totalTwo += 1;
      const tempInventory = combinedInventory.filter(function (item) {
        return item.item_url.includes([`${valued}`]);
      });

      for (const [, value] of Object.entries(tempInventory)) {
        thisInventory.push(value);
      }
    }
  }

  if (totalTwo > 0) {
    combinedInventory = thisInventory;
  }

  // First and third check

  for (const [, value] of Object.entries(filtersData)) {
    let valued = value as String;
    let command = valued.substring(0, 1);
    valued = valued.substring(1);
    let secondValued = valued.slice(0, -1);

    // First filter
    if (command == '1') {
      combinedInventory = combinedInventory.filter(function (item) {
        if (valued == 'trade_unlock' && item[`${valued}`] != null) {
          return true;
        }
        if (valued == 'item_customname' && item[`${valued}`] != null) {
          return true;
        }
        return item[`${valued}`] == true;
      });
    }
    if (command == '3') {
      combinedInventory = combinedInventory.filter(function (item) {
        if (secondValued == 'trade_unlock' && item[`${secondValued}`] == null) {
          return true;
        }
        if (valued == 'econ/tools/casket') {
          return item.item_url.includes([`${valued}`]) == false;
        }
        return false;
      });
    }
    if (command == '4') {
      combinedInventory = combinedInventory.filter(function (item) {
        if (valued == 'econ/tools/casket') {
          return item.item_url.includes([`${valued}`]) == true;
        }
        return false;
      });
    }
  }
  combinedInventory = await sortDataFunction(sortData, combinedInventory, prices, pricingSource);

  return combinedInventory;
}
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}




export async function sortDataFunction(sortValue, inventory, prices, pricingSource) {
  function sortRun(valueOne, ValueTwo, useNaN = false) {
    
    if (valueOne < ValueTwo) {
      return -1;
    }
    if (valueOne > ValueTwo) {
      return 1;
    }

    if (useNaN && isNaN(valueOne)) {
      return -1
    }
    return 0;

  }

  // Check
  if (sortValue == 'Storages') {
    inventory.sort(function (a, b) {
      return sortRun(a.item_customname, b.item_customname)
    });
    return inventory;
  }
  // First sort by Name
  inventory.sort(function (a, b) {
    return sortRun(a.item_name.replaceAll('★', '').replaceAll(' ', ''), b.item_name.replaceAll('★', '').replaceAll(' ', ''))
  });
  switch(sortValue) {

    case 'Default':
      inventory.sort(function (a, b) {
        return sortRun(a.position, b.position)
      });
      return inventory;
    
    case 'Category':
      inventory.sort(function (a, b) {
        return sortRun(a.category, b.category)
      });
      return inventory;

    case 'QTY':
      inventory.sort(function (a, b) {
        return -sortRun(a.combined_QTY, b.combined_QTY)
      });
      return inventory;
    
    case 'Price':
      inventory.sort(function (a, b) {
        return -sortRun(prices[a.item_name]?.[pricingSource] * a.combined_QTY, prices[b.item_name]?.[pricingSource] * b.combined_QTY)
      });
      return inventory;
    
    case 'Stickers':
      inventory.sort(function (a, b) {
        return -sortRun(a?.stickers?.length, b?.stickers?.length)
      });
      return inventory;
    
    case 'StorageName':
      inventory.sort(function (a, b) {
        return sortRun(a?.storage_name, b?.storage_name)
      });
      return inventory;

    case 'tradehold':
      const now = new Date();
      inventory.sort(function (a, b) {
        return sortRun(a?.trade_unlock?.getTime() - now.getTime(), b?.trade_unlock?.getTime() - now.getTime(), true)
      });
      return inventory;

    default:
      return inventory
  }
}

export async function downloadReport(storageData) {
  let csvContent = "Item Name,Item Custom Name, Price, Price Combined, Item Moveable, Storage Name, Tradehold, Category, Combined QTY, Item Wear Name, Item Paint Wear,Item Has Stickers/Patches,Stickers\n";
  var csv = storageData.map(function(d){
    let storageName = d.storage_name
    if (storageName == undefined) {
      storageName = '#Inventory'
    }

    let stickersData = d.stickers;
    if (stickersData != []) {
      let newStickers = [] as any;
      stickersData.forEach(element => {
        newStickers.push(element.sticker_name)
      });
      stickersData = newStickers.join(';');
    }
    const returnDict = {
      item_name: d.item_name,
      item_customname: d.item_customname,
      price: d.item_price,
      price_combined: d.item_price_combined,
      item_moveable: d.item_moveable,
      storage_name: storageName,
      trade_unlock: d.trade_unlock,
      category: d.category,
      combined_QTY: d.combined_QTY,
      item_wear_name: d.item_wear_name,
      item_paint_wear: d.item_paint_wear,
      item_has_stickers: d.item_has_stickers,
      item_stickers: stickersData
    }
    return JSON.stringify(Object.values(returnDict));
})
.join('\n')
.replaceAll('null', '')
.replace(/(^\[)|(\]$)/mg, '');
csv = csvContent + csv
window.electron.ipcRenderer.downloadFile(csv)
}

export async function getPricing(productName) {
  return new Promise((resolve,) => {
    axios
    .get(`https://.co/pricing/${productName}`)
    .then(function(response) {
      console.log(response)
      resolve(response)
    })
}).catch(error => console.log(error.message));

}
