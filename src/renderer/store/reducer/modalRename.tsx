const initialState = {
    renameOpen: false,
    modalPayload: {}
  };

  const modalRenameReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_RENAME_MODAL':
          return {
              ...state,
              renameOpen: true,
              modalPayload: action.payload
          } 
      case 'CLOSE_RENAME_MODAL':
        return {
            ...state,
            renameOpen: false
        }
      case 'SIGN_OUT': 
        return {
          ...initialState
        }
      default:
        return {...state}
      
    }
  };


  export default modalRenameReducer;