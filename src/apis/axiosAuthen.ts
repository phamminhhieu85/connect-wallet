import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_ENDPOINT } from 'constants/index';
import Web3 from 'web3';
import { toast } from 'react-toastify';

import { getRandomUint40, localStorageCustom } from 'utils';
// redux
import { dispatch } from 'redux/store';
import { removeUserLogin } from 'redux/slices/web3InfoSlice';

const web3 = new Web3(Web3.givenProvider);
const MESSAGE =
	'Welcome to NFT SpaceX\nForbitswap NFTs Exchange is a hybrid off-chain/on-chain system\n where orders with signatures are stored in the server side until they are matched.\nIt is a non-custodial exchange where the atomic match is executed right away\nwhen 2 orders are fully compatible and authorized by creators of orders.\nNonce: ';

const axiosAuthen = axios.create({
	baseURL: API_ENDPOINT,
	headers: {
		'Content-Type': 'application/json',
	},
});

declare module 'axios' {
	export interface AxiosRequestConfig {
		_retry?: boolean;
	}
}

// Add a request interceptor
axiosAuthen.interceptors.request.use(
	async function (config: AxiosRequestConfig) {
		// Do something before request is sent

		const signature: string | null = localStorageCustom.getSignature();
		const signatureMessageHash: string | null = localStorageCustom.getSignatureMessageHash();
		const chainId = await web3.eth.getChainId();

		config.data = {
			...config.data,
			signature: signature ?? 'signature',
			secret: signatureMessageHash ?? 'secret',
			chainId: chainId,
		};

		return config;
	},
	function (error: any) {
		// Do something with request error
		return Promise.reject(error);
	}
);

// Add a response interceptor
axiosAuthen.interceptors.response.use(
	function (response: AxiosResponse) {
		// Any status code that lie within the range of 2xx cause this function to trigger
		// Do something with response data
		return response.data;
	},
	async function (error: AxiosError) {
		// Any status codes that falls outside the range of 2xx cause this function to trigger
		// Do something with response error
		const originalConfig: AxiosRequestConfig = error.config;

		// error "Not Authenticate" or "Signature Expired"
		if (
			(error.response?.status === 451 || error.response?.status === 401) &&
			!originalConfig._retry
		) {
			try {
				originalConfig._retry = true; // prevent infinite loop

				const userAddress = await web3.eth.getAccounts();
				const chainId = await web3.eth.getChainId();
				userAddress[0] = userAddress[0].toLowerCase();

				const newSignatureMessageHash = `${MESSAGE}${getRandomUint40()}`;
				const newSignature = await web3.eth.personal.sign(
					newSignatureMessageHash,
					userAddress[0],
					''
				);

				localStorageCustom.setSignature(newSignature);
				localStorageCustom.setSignatureMessageHash(newSignatureMessageHash);

				// refresh signature
				await axiosAuthen.post(`users/refreshSignature`, {
					userAddress: userAddress[0],
					chainId: chainId,
				});

				originalConfig.data = {
					...JSON.parse(originalConfig.data),
					signature: newSignature,
					secret: newSignatureMessageHash,
					chainId: chainId,
				};

				return await axiosAuthen(originalConfig); // call back request have been failed
			} catch (error: any) {
				toast.error(error.message);
				dispatch(removeUserLogin());
			}
		}

		return Promise.reject(error);
	}
);

export default axiosAuthen;
