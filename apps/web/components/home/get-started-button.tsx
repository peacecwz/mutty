import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import classNames from 'classnames';

export interface GetStartedButton {
  type: 'full' | 'small'
}

const ApproveLogin = ({ open, setOpen, onSubmit }) => {
  const cancelButtonRef = useRef(null)

  const [pin, setPin] = useState('');

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 -ml-96 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpen}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Deactivate account
                    </Dialog.Title>
                    <div className="mt-2">
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        PIN Code
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="pin"
                          id="pin"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="PIN Code"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => onSubmit && onSubmit(pin)}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setOpen(false)
                    setPin('');
                  }}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


const GetStartedButton = ({ type }: GetStartedButton) => {
  const router = useRouter();
  const [canOpenPopup, setCanOpenPopup] = useState(false);
  const [oauthToken, setOauthToken] = useState('');
  const [openedWindow, setOpenedWindow] = useState(null);

  const handleLogin = async () => {
    const { authorizeURL, oauth_token } = await fetch('/api/account/login', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(res => res.json());
    setOauthToken(oauth_token);

    setOpenedWindow(window.open(authorizeURL, 'Login to Mutty on Twitter', `_target=blank,width=600,height=800,left=${window.innerWidth}`));

    setTimeout(() => {
      setCanOpenPopup(true);
    }, 3 * 1000);
  };

  const handleSubmit = async (pin: string) => {
    const { success } = await fetch('/api/account/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pin,
        oauth_token: oauthToken
      })
    }).then(res => res.json());

    if (success) {
      openedWindow?.close();
      router.push({
        pathname: '/mutes/list'
      });
    }
  }

  const style = classNames('items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10', {
    'w-full flex': type === 'full',
    'inline-flex': type === 'small'
  })

  return (
    <>
      <button
        onClick={handleLogin}
        className={style}
      >
        Login & Get started
      </button>
      <ApproveLogin open={canOpenPopup} setOpen={setCanOpenPopup} onSubmit={handleSubmit} />
    </>
  )
}

export default GetStartedButton;
