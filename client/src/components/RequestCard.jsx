import { motion } from 'framer-motion';

import { FiCheck, FiX, FiAward, FiStar } from 'react-icons/fi';

import RequestScheduling from './RequestScheduling';
import { getAvatarUrl } from '../utils/avatar';



const statusColors = {

  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',

  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',

  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',

  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',

};



const RequestCard = ({

  request,

  isReceived,

  currentUserId,

  onAccept,

  onReject,

  onComplete,

  onReview,

  onRefresh,

}) => {

  const partner = isReceived ? request.sender : request.receiver;



  return (

    <motion.div layout className="glass-card p-5">

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <img src={getAvatarUrl(partner)} alt="" className="w-12 h-12 rounded-xl object-cover" />

          <div>

            <p className="font-semibold text-gray-900 dark:text-white">{partner?.name}</p>

            <p className="text-sm text-gray-500">

              Offer: <span className="text-primary-600">{request.offeredSkill}</span>

              {' → '}

              Want: <span className="text-accent-600">{request.wantedSkill}</span>

            </p>

          </div>

        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[request.status]}`}>

          {request.status}

        </span>

      </div>



      {request.message && (

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">"{request.message}"</p>

      )}



      <div className="flex flex-wrap gap-2 mt-4">

        {isReceived && request.status === 'pending' && (

          <>

            <button onClick={() => onAccept(request._id)} className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">

              <FiCheck /> Accept

            </button>

            <button onClick={() => onReject(request._id)} className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">

              <FiX /> Reject

            </button>

          </>

        )}

        {request.status === 'accepted' && (

          <button onClick={() => onComplete(request._id)} className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600">

            <FiAward /> Mark Complete

          </button>

        )}

        {request.status === 'completed' && onReview && (

          <button

            onClick={() => onReview(request)}

            className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"

          >

            <FiStar /> Leave Review

          </button>

        )}

      </div>



      {currentUserId && (

        <RequestScheduling

          request={request}

          currentUserId={currentUserId}

          onUpdated={onRefresh}

        />

      )}

    </motion.div>

  );

};



export default RequestCard;

