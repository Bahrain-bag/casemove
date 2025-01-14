const initialState = {
  inventoryFilter: ['1item_moveable'] as any,
  sortValue: 'Default',
  inventoryFiltered: [] as any,
  searchInput: '',
  sortBack: false,
  categoryFilter: [] as any
};

const inventoryFiltersReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ALL_BUT_CLEAR':
      if (state.sortValue == action.payload.sortValue) {
        return {
          ...state,
          inventoryFilter: action.payload.inventoryFilter,
          sortValue: action.payload.sortValue,
          inventoryFiltered: action.payload.inventoryFiltered,
          sortBack: !state.sortBack
        }
      } else {
        return {
          ...state,
          inventoryFilter: action.payload.inventoryFilter,
          sortValue: action.payload.sortValue,
          inventoryFiltered: action.payload.inventoryFiltered,
          sortBack: initialState.sortBack
        }
      }

    case 'CLEAR_ALL':
      return {
        ...initialState,
        inventoryFilter: []
      }
    case 'MOVE_FROM_CLEAR':
      return {
        ...initialState
      }


    case 'MOVE_FROM_CLEAR_ALL':
      return {
        ...state,
        categoryFilter: []

      }
    case 'MOVE_TO_CLEAR_ALL':
      return {
        ...state,
        categoryFilter: []
      }

    case 'INVENTORY_ADD_CATEGORY_FILTER':
      console.log(action.payload)
      console.log(state.categoryFilter)
      console.log(state)
      let newFilters = state.categoryFilter
      if (newFilters.includes(action.payload)) {
        newFilters.splice(newFilters.indexOf(action.payload), 1)
      } else {
        newFilters = [...newFilters, action.payload]
      }
      console.log(newFilters)
      return {
        ...state,
        categoryFilter: newFilters
      }
    case 'INVENTORY_FILTERS_SET_SEARCH':
      return {
        ...state,
        searchInput: action.payload.searchField
      }
    case 'SIGN_OUT':
      return {
        ...initialState
      }
    default:
      return { ...state }

  }
};

export default inventoryFiltersReducer;
