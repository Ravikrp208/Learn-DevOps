import React from 'react'
export const userDataContext = createContext()
function UserProvider ({children}) {
    const serverurl = "http://localhost:8000"
    const value = {serverurl}
    
    return (
    <div>
        <userContext.Provider value={{value}}>
            {children}
        </userContext.Provider>
       
        </div>
        
    )
}
export default UserProvider;    