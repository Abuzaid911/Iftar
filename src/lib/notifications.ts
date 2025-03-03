import toast from 'react-hot-toast'

export const notify = {
  vote: () => {
    toast.success('Vote counted! 🎉', {
      style: {
        background: '#000',
        color: '#F7B538',
        border: '1px solid rgba(247, 181, 56, 0.1)',
      },
      iconTheme: {
        primary: '#F7B538',
        secondary: '#000',
      },
    })
  },
  
  win: () => {
    toast('Congratulations! You won today! 🏆', {
      duration: 5000,
      icon: '🌙',
      style: {
        background: '#000',
        color: '#F7B538',
        border: '1px solid rgba(247, 181, 56, 0.1)',
      },
    })
  }
}