'use client'

import { 
  TwitterShareButton, 
  FacebookShareButton, 
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  TwitterIcon,
  FacebookIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon
} from 'react-share'

interface ShareButtonsProps {
  url: string
  title: string
  image?: string
  description?: string
}

export default function ShareButtons({ url, title, image, description }: ShareButtonsProps) {
  const shareText = `Check out this Iftar post! ${title}`
  const fullDescription = description ? `${shareText}\n\n${description}` : shareText

  return (
    <div className="flex flex-wrap gap-2">
      <TwitterShareButton url={url} title={shareText} via="IftarApp" hashtags={['Iftar', 'Ramadan']}>
        <TwitterIcon size={32} round className="hover:opacity-80 transition-opacity" />
      </TwitterShareButton>
      
      <FacebookShareButton url={url} quote={fullDescription} hashtag="#Ramadan">
        <FacebookIcon size={32} round className="hover:opacity-80 transition-opacity" />
      </FacebookShareButton>
      
      <WhatsappShareButton url={url} title={fullDescription}>
        <WhatsappIcon size={32} round className="hover:opacity-80 transition-opacity" />
      </WhatsappShareButton>

      <TelegramShareButton url={url} title={fullDescription}>
        <TelegramIcon size={32} round className="hover:opacity-80 transition-opacity" />
      </TelegramShareButton>

      <LinkedinShareButton url={url} title={title} summary={description} source="Iftar App">
        <LinkedinIcon size={32} round className="hover:opacity-80 transition-opacity" />
      </LinkedinShareButton>
    </div>
  )
}