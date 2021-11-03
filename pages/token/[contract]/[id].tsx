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
const reroll_abi = require('./reroll-abi.json');
const threewords_abi = require('./threewords-abi.json');
const threewordsContractAddress = '0x699c848ceb3a98a7a982bd6ddc6a39e4a363d4b4';
const rerollContractAddress = '0x350cb870cd263edea5b9f447096e98f15118861f';
const network = 'rinkeby';

const styles = {
  theme: {
    lineSpacing: 24,
    linkColor: "var(--black)",
  },
};

type PieceProps = {
  id:  string,
  name: string;
  description: string;
  image: string;
  initialData: any;
};

const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE;

function Piece({
  id,
  name,
  description,
  image,
  initialData,
}: PieceProps) {
  const { query } = useRouter();

  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [rerollContract, setRerollContract] = useState<ethers.Contract>()
  const [threeWordsContract, setThreeWordsContract] = useState<ethers.Contract>()

  // const [id, setID] = useState<string>()

  const [word1, setWord1] = useState<string>()
  const [word2, setWord2] = useState<string>()
  const [word3, setWord3] = useState<string>()

  const [last_word1, setLastWord1] = useState<string>()
  const [last_word2, setLastWord2] = useState<string>()
  const [last_word3, setLastWord3] = useState<string>()


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
         if (!rerollContract) {

           const rerollContract = new ethers.Contract(rerollContractAddress, reroll_abi, provider.getSigner())
           const threeWordsContract = new ethers.Contract(threewordsContractAddress, threewords_abi, provider.getSigner())
           setRerollContract(rerollContract)
           setThreeWordsContract(threeWordsContract)
           console.log('contracts set')
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
   function areStringsDifferent(a:string, b:string): number {
    if (a != b ) {
        return 0;
    }
    else{
        return 1;
    }
   }
   const handleReRoll = useCallback((e) => {
     // ignore this
     e.preventDefault();
     if (!rerollContract) {
       console.log("something is up with the contract")
       return
     }

     let _tokenIdToPhraseId = rerollContract._tokenIdToPhraseId(id);

     if (_tokenIdToPhraseId == 0 && threeWordsContract){
         let words = threeWordsContract.tokenIdToWords(id);
         setLastWord1(words[0]);
         setLastWord2(words[1]);
         setLastWord3(words[2]);
     }
     else{
       setLastWord1(rerollContract.lastWord1[id]);
       setLastWord2(rerollContract.lastWord2[id]);
       setLastWord3(rerollContract.lastWord3[id]);
     }

     console.log(typeof(word1));
     console.log(typeof(last_word1));

     const w1:number = areStringsDifferent(word1, last_word1);
     const w2:number = areStringsDifferent(word2, last_word2);
     const w3:number = areStringsDifferent(word3, last_word3);
     const totalPrice = 0.111*(w1+w2+w3);


     let overrides = {
       // To convert Ether to Wei:
       value: ethers.utils.parseEther(totalPrice.toString)     // ether in this case MUST be a string

       // Or you can use Wei directly if you have that:
       // value: someBigNumber
       // value: 1234   // Note that using JavaScript numbers requires they are less than Number.MAX_SAFE_INTEGER
       // value: "1234567890"
       // value: "0x1234"
     };
     // handle the click event
     const go = async () => {
       contract.functions.ReRoll(id, word1, word2, word3, overrides)
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
      {wallet.status === 'connected' && wallet.balance != '-1' ? (
          <div>
            <div><button onClick={() => wallet.reset()}>disconnect</button> Account: {wallet.account}</div>
          </div>
        ) : (
          <div>
            {/* we should modify this onClick to use a proper useCallback function which also does optional walletconnect instead of metamask - maybe use web3modal react package so we can use even more wallets */}
            <button onClick={() => wallet.connect('injected')}>Connect Metamask</button>
          </div>
        )}
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
