import { useTransactions } from '../../context/TransactionContext'

const PrivacyValue = ({ children, className = "" }) => {
    const { isPrivacyMode } = useTransactions()

    return (
        <span className={`${className} transition-all duration-300 ${isPrivacyMode ? 'blur-[6px] select-none pointer-events-none' : ''}`}>
            {children}
        </span>
    )
}

export default PrivacyValue
