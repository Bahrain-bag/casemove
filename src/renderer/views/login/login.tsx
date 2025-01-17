import { Disclosure } from '@headlessui/react'
import { useState } from 'react'
import LoginForm from './loginForm'
import UserGrid from './userManagement'
Disclosure
export default function LoginPage() {
  const [getLock, setLock] = useState('')

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <main className="lg:min-h-full lg:overflow-hidden lg:flex lg:flex-row-reverse dark:bg-dark-level-two">
     

        {/* Account switcher */}
        <section aria-labelledby="summary-heading" className="hidden w-full max-w-xs flex-col lg:flex">
         

          <UserGrid clickOnProfile={(username) => setLock(username)}/>
        </section>

        {/* Login */}
        <section
          aria-labelledby="payment-heading"
          className="flex-auto overflow-y-auto px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-0 bg-white lg:pb-24 dark:bg-dark-level-one"
        >
          <div className="max-w-lg mx-auto">
            <LoginForm isLock={getLock} replaceLock={() => setLock('')}/>
          </div>
        </section>
      </main>
    </>
  )
}
