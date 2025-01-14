import { LockClosedIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingButton } from 'renderer/components/content/shared/animations';
import combineInventory, {
  classNames,
} from 'renderer/components/content/shared/inventoryFunctions';
import NotificationElement from 'renderer/components/content/shared/modals & notifcations/notification';
import SteamLogo from 'renderer/components/content/shared/steamLogo';
import { filterInventorySetSort } from 'renderer/store/actions/filtersInventoryActions';
import { setInventoryAction } from 'renderer/store/actions/inventoryActions';
import { setCurrencyRate, setLocale, setSourceValue } from 'renderer/store/actions/settings';
import { signIn } from 'renderer/store/actions/userStatsActions';
import { getURL } from 'renderer/store/helpers/userStatusHelper';

export default function LoginForm({ isLock, replaceLock }) {
  // Usestate
  const pricesResult = useSelector((state: any) => state.pricingReducer);
  const settingsData = useSelector((state: any) => state.settingsReducer);
  isLock;
  replaceLock;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');
  const [doShow, setDoShow] = useState(false);
  const [wasSuccess, setWasSuccess] = useState(false);
  const [titleToDisplay, setTitleToDisplay] = useState('test');
  const [textToDisplay, setTextToDisplay] = useState('test');
  const [storePassword, setStorePassword] = useState(true);
  const [getLoadingButton, setLoadingButton] = useState(false);
  const [secretEnabled, setSecretEnabled] = useState(false);
  const filterDetails = useSelector(
    (state: any) => state.inventoryFiltersReducer
  );
  // Handle login
  const dispatch = useDispatch();
  // Return 1 = Success
  // Return 2 = Steam Guard
  // Return 3 = Steam Guard wrong
  // Return 4 = Wrong password
  // Return 5 = Playing elsewhere

  async function openNotification(success, title, text) {
    setWasSuccess(success);
    setTitleToDisplay(title);
    setTextToDisplay(text);
    setDoShow(true);
  }
  async function onSubmit() {
    setLoadingButton(true);
    let responseCode = 1;
    responseCode = 1;
    let usernameToSend = username;
    let passwordToSend = password;
    if (isLock != '') {
      usernameToSend = isLock;
      passwordToSend = '~{nA?HJjb]7hB7-';
    }
    const responseStatus = await window.electron.ipcRenderer.loginUser(
      usernameToSend,
      passwordToSend,
      storePassword,
      authCode,
      sharedSecret
    );
    responseCode = responseStatus[0];

    // Notification
    switch (responseCode) {
      case 1:
        openNotification(
          true,
          'Logged in successfully!',
          'The app has successfully logged you in. Happy storaging.'
        );
        break;
      case 2:
        openNotification(
          false,
          'Steam Guard error!',
          'Steam Guard might be required. Try again.'
        );
        break;
      case 3:
        openNotification(
          false,
          'Wrong Steam Guard code',
          'Got the wrong Steam Guard code. Try again.'
        );
        break;

      case 4:
        openNotification(
          false,
          'Unknown error',
          'Could be wrong credentials, a network error, the account playing another game or something else. ' +
            responseStatus[1]
        );
        setUsername('');
        setPassword('');
        break;

      case 5:
        openNotification(
          false,
          'Playing elsewhere',
          'You were logged in but the account is currently playing elsewhere. Close the session and try again.'
        );
        break;
    }
    // If success login

    if (responseCode == 1) {
      // Currency rate
      await window.electron.ipcRenderer
        .getCurrencyRate()
        .then((returnValue) => {
          console.log('currencyrate', returnValue);
          dispatch(setCurrencyRate(returnValue[0], returnValue[1]));
        });
      // Source
      await window.electron.store.get('pricing.source').then((returnValue) => {
        let valueToWrite = returnValue;
        if (returnValue == undefined) {
          valueToWrite = {
            id: 1,
            name: 'Steam Community Market',
            title: 'steam_listing',
            avatar: 'https://steamcommunity.com/favicon.ico',
          };
        }
        dispatch(setSourceValue(valueToWrite));
      });
      await window.electron.store.get('locale').then((returnValue) => {
        dispatch(setLocale(returnValue));
      });
      let returnPackage = {
        steamID: responseStatus[1][0],
        displayName: responseStatus[1][1],
        CSGOConnection: responseStatus[1][2],
      };
      await new Promise((r) => setTimeout(r, 2500));
      try {
        const profilePicture = await getURL(returnPackage.steamID);
        returnPackage['userProfilePicture'] = profilePicture;
      } catch (error) {
        returnPackage['userProfilePicture'] =
          'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/pak01_dir/resource/flash/econ/characters/customplayer_tm_separatist.png';
      }

      dispatch(signIn(returnPackage));
      const combined = await combineInventory(responseStatus[1][3]);
      dispatch(
        setInventoryAction({
          inventory: responseStatus[1][3],
          combinedInventory: combined,
        })
      );
      dispatch(
        await filterInventorySetSort(
          combined,
          filterDetails,
          filterDetails.sortValue,
          pricesResult.prices,
          settingsData?.source?.title
        )
      );
    } else {
      setAuthCode('');
    }
    setLoadingButton(false);
  }
  async function updateUsername(value) {
    setUsername(value);
    if (isLock != '') {
      replaceLock();
    }
  }
  async function updatePassword(value) {
    setPassword(value);
    if (isLock != '') {
      replaceLock();
    }
  }

  const [seenOnce, setOnce] = useState(false);
  const [sendSubmit, shouldSubmit] = useState(false);
  if (seenOnce == false) {
    document.addEventListener('keyup', ({ key }) => {
      if (key == 'Enter') {
        shouldSubmit(true);
      }
    });
    setOnce(true);
  }

  if (sendSubmit) {
    onSubmit();
    shouldSubmit(false);
  }

  return (
    <>
      <div className="min-h-full flex items-center  pt-32 justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <SteamLogo />
            <h2 className="mt-6 text-center dark:text-dark-white text-3xl font-extrabold text-gray-900">
              Connect to Steam
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              The application needs to have an active Steam connection to manage
              your CSGO items. You should not have any games open on the Steam account.
            </p>
          </div>
          <form className="mt-8 space-y-6" action="#" method="POST">
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  onChange={(e) => updateUsername(e.target.value)}
                  spellCheck={false}
                  required
                  value={isLock == '' ? username : isLock}
                  className="appearance-none dark:bg-dark-level-one dark:text-dark-white dark:bg-dark-level-one  dark:border-opacity-50 rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  onChange={(e) => updatePassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  value={isLock == '' ? password : '~{nA?HJjb]7hB7-'}
                  className="appearance-none dark:text-dark-white rounded-none dark:bg-dark-level-one  dark:border-opacity-50 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <label htmlFor="authcode" className="sr-only">
                  Authcode
                </label>
                <input
                  id="authcode"
                  name="authcode"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  spellCheck={false}
                  required
                  className="appearance-none rounded-none dark:bg-dark-level-one dark:text-dark-white dark:border-opacity-50 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Authcode (optional)"
                />
              </div>
              <div className={classNames(secretEnabled ? '' : 'hidden')}>
                <label htmlFor="authcode" className="sr-only">
                  SharedSecret
                </label>
                <input
                  id="secret"
                  name="secret"
                  value={sharedSecret}
                  onChange={(e) => setSharedSecret(e.target.value)}
                  spellCheck={false}
                  required
                  className="appearance-none rounded-none dark:bg-dark-level-one dark:text-dark-white dark:border-opacity-50 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Shared Secret (If you don't know what this is, leave it empty.)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/*

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ``` */}
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked={storePassword}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  onChange={() => setStorePassword(!storePassword)}
                />

                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-dark-white"
                >
                  Remember for later
                </label>
              </div>

              <div className="flex items-center">
                <label
                  htmlFor="sharedSecret"
                  className="mr-2 block text-sm text-gray-900 dark:text-dark-white"
                >
                  Show secret field
                </label>
                <input
                  id="sharedSecret"
                  name="sharedSecret"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  onChange={() => setSecretEnabled(!secretEnabled)}
                />
              </div>
            </div>

            <div>
              <button
                className={classNames(settingsData.darkmode ? 'focus:bg-indigo-700' : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500', 'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ')}

                onClick={() => onSubmit()}
                type="button"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {getLoadingButton ? (
                    <LoadingButton />
                  ) : (
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  )}
                </span>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
      <NotificationElement
        success={wasSuccess}
        titleToDisplay={titleToDisplay}
        textToDisplay={textToDisplay}
        doShow={doShow}
        setShow={() => {
          setDoShow(false);
        }}
      />
    </>
  );
}
