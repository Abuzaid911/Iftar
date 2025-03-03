'use client'

import { 
  TwitterShareButton, 
  FacebookShareButton, 
  WhatsappShareButton,
  TwitterIcon,
  FacebookIcon,
  WhatsappIcon
} from 'react-share'

interface ShareButtonsProps {
  url: string
  title: string
  image?: string
}

export default function ShareButtons({ url, title, image }: ShareButtonsProps) {
  const shareText = `Check out this Iftar post! ${title}`

  return (
    <div className="flex space-x-2">
      <TwitterShareButton url={url} title={shareText}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <FacebookShareButton url={url} quote={shareText} hashtag="#IftarShare">
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <WhatsappShareButton url={url} title={shareText}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
    </div>
  )
}