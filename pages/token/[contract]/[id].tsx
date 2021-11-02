import { NFTFullPage, MediaConfiguration } from "@zoralabs/nft-components";
import { useRouter } from "next/router";
import {
  MediaFetchAgent,
  NetworkIDs,
  FetchStaticData,
} from "@zoralabs/nft-hooks";
import { GetServerSideProps } from "next";
import { useCallback, useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { useWallet, UseWalletProvider } from 'use-wallet';
import { PageWrapper } from "../../../styles/components";
import Head from "../../../components/head";
const abi = require('./abi.json');
const contractAddress = '0x350cb870cd263edea5b9f447096e98f15118861f';
const network = 'rinkeby';

const styles = {
  theme: {
    lineSpacing: 24,
    linkColor: "var(--black)",
  },
};

type PieceProps = {
  name: string;
  description: string;
  image: string;
  initialData: any;
};

const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE;

function Piece({
  name,
  description,
  image,
  initialData,
}: PieceProps) {
  const { query } = useRouter();

  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [contract, setContract] = useState<ethers.Contract>()

  // const [id, setID] = useState<string>()

  const [word1, setWord1] = useState<string>()
  const [word2, setWord2] = useState<string>()
  const [word3, setWord3] = useState<string>()

  const inputEl1 = useRef(null);
  const inputEl2 = useRef(null);
  const inputEl3 = useRef(null);

  const wallet = useWallet()

  useEffect(() => {
     if (wallet && wallet.ethereum) {
       // this code will run when wallet is all set. nothing async happening here for now.
       if (!provider) {
         const newProvider = new ethers.providers.Web3Provider(wallet.ethereum, network)
         setProvider(newProvider)
         console.log('provider set')
       }
     }
   }, [wallet])

   useEffect(() => {
     const go = async () => {
       if (provider) {
         // this code will run when provider is set
         if (!contract) {

           const contract = new ethers.Contract(contractAddress, abi, provider.getSigner())
           setContract(contract)
           console.log('contract set')
         }
       }
     }
     go()
   }, [provider])


   // useEffect(() => {
   //   const go = async () => {
   //     if (!id) {
   //       setID(query.id);
   //       console.log('id set to')
   //       console.log(query.id)
   //     }
   //   }
   //   go()
   // }, [id])

   const handleReRoll = useCallback((e) => {
     // ignore this
     e.preventDefault();
     if (!contract) {
       console.log("something is up with the contract")
       return
     }
     let overrides = {
       // To convert Ether to Wei:
       value: ethers.utils.parseEther("0.333")     // ether in this case MUST be a string

       // Or you can use Wei directly if you have that:
       // value: someBigNumber
       // value: 1234   // Note that using JavaScript numbers requires they are less than Number.MAX_SAFE_INTEGER
       // value: "1234567890"
       // value: "0x1234"
     };
     // handle the click event
     const go = async () => {
       console.log("why am I seeing nothing? ??")
       // console.log(id)
       contract.functions.ReRoll(1, word1, word2, word3, overrides)
     }
     go()
   }, [wallet, provider, contract, word1, word2, word3]);


  return (
    <>
      <Head
        title={`${name} | ${APP_TITLE}`}
        description={description}
        ogImage={image}
      />
      <MediaConfiguration
        networkId={process.env.NEXT_PUBLIC_NETWORK_ID as NetworkIDs}
        style={styles}
      >
        <PageWrapper>
          <NFTFullPage
            useBetaIndexer={true}
            contract={query.contract as string}
            id={query.id as string}
            initialData={initialData}
          />
        </PageWrapper>
      </MediaConfiguration>
      <form onSubmit={handleReRoll}>
        <div>
          <label >Word 1:
            <input
              ref={inputEl1}
              type="text"
              name="word1"
              onChange={e => setWord1(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label >Word 2:
            <input
              ref={inputEl2}
              type="text"
              name="word2"
              onChange={e => setWord2(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label >Word 3:
            <input
              ref={inputEl3}
              type="text"
              name="word3"
              onChange={e => setWord3(e.target.value)}
            />
          </label>
        </div>
        <div>
          <button type='submit' onClick={handleReRoll}>reroll (0.333 ETH)</button>
        </div>
      </form>
    </>
  );
}

// Wrap everything in <UseWalletProvider />
export default (props: PieceProps) => (
  <UseWalletProvider>
    <Piece {...props}/>
  </UseWalletProvider>
)


export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.id || Array.isArray(params.id)) {
    return { notFound: true };
  }
  if (!params?.contract || Array.isArray(params.contract)) {
    return { notFound: true };
  }

  const id = params.id as string;
  const contract = params.contract as string;

  const fetchAgent = new MediaFetchAgent(
    process.env.NEXT_PUBLIC_NETWORK_ID as NetworkIDs
  );
  const data = await FetchStaticData.fetchZoraIndexerItem(fetchAgent, {
    tokenId: id,
    collectionAddress: contract,
  });

  const tokenInfo = FetchStaticData.getIndexerServerTokenInfo(data);

  return {
    props: {
      id,
      name: tokenInfo.metadata?.name || null,
      description: tokenInfo.metadata?.description || null,
      image: tokenInfo.image || null,
      initialData: data,
    },
  };
};
