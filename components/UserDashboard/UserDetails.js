import React from "react"
import Link from "next/link"
import { useUiStore } from "stores/useUiStore"
import { useMutation, useQuery } from "react-query"
import * as api from "../../query"
import { useAccount, useConnect } from "wagmi"

const UserDetails = ({ address, ens }) => {
  const [{ data: connectData, error: connectError }, connect] = useConnect()
  const [{ data, error, loading }, disconnect] = useAccount()
  const { data: friendData } = useQuery(
    "friends",
    () => api.getFriends({ initiator: address }),
    { refetchOnWindowFocus: false }
  )
  console.log('data ', data)


  const setConnectModalOpen = useUiStore(state => state.setConnectModalOpen)

  const { status, mutateAsync } = useMutation(api.reqRelationship)

  const getUserRelationship = (friends) => {
    let relationship;

    if(!friends?.length) {
      return 
    }

    for(const friend of friends) {
      if(friend.initiator == data?.address || friend.target == data?.address) {
        relationship = friend.status;
        return relationship
      }
    }

    return null;
  }

  const handleRequest = () => {
    if(!data?.address) {
      return 
    }
    const req = {
      initiator: data.address,
      target: address,
      status: 3,
    }

    mutateAsync(req)
  }

  return (
    <div className="mt-4 flex flex-col items-center text-center md:items-start md:text-left">
      {ens ? (
        <span className="h-10 w-full bg-gradient-to-r from-[#0DB2AC] via-[#FC8D4D] to-[#FABA32] bg-clip-text text-3xl text-transparent">
          @{ens}
        </span>
      ) : (
        <span className="h-10 w-full bg-gradient-to-r from-[#0DB2AC] via-[#FC8D4D] to-[#FABA32] bg-clip-text text-3xl text-transparent">
          @{`${address.substring(0, 6) + "..."}`}
        </span>
      )}

      {data?.address === address ? (
        <></>
      ) : status === "success" ? (
        // style and persist through validating relationship status
        <span className="my-4 w-max rounded-full bg-lime-200 px-4 py-2 shadow hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-700">
          pending
        </span>
      ) : connectData?.connected && getUserRelationship(friendData) === 1 ? (
        <button
          className="my-4 w-max rounded-full bg-gradient-to-r from-[#0DB2AC] via-[#FC8D4D] to-[#FABA32] text-xl text-white px-4 py-2 shadow"
        >
          friends
        </button>
      ) : (
        <button
          className="my-4 w-max rounded-full bg-slate-200 px-4 py-2 shadow hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-700"
          onClick={() => {
            if(getUserRelationship(friendData) === 3) {
              return 
            } else {
              handleRequest()
            }
          }}
        >
          { data?.address && getUserRelationship(friendData) === 3 ? "pending" : "request" }
        </button>
      )}
      <div className="mt-4 ml-4 mb-4 mr-4 flex flex-row">
      <span className="cursor-pointer">
        {friendData?.length} {friendData?.length === 1 ? "friend" : "friends"}
      </span>
      </div>
      </div>
  )
}

export default UserDetails
