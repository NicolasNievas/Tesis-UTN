import LoadingSpinner from "./LoadingSpinner";

interface IButtonProps {
  name: string;
  onClick?: () => void;
  className?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const Button = ({ name, onClick, className, isDisabled=false, isLoading }: IButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`w-full h-[100px] p-4 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)]
      ${isDisabled ? "bg-gray-bg-light text-white hover:bg-gray-bg-light cursor-not-allowed" : ""}
      ${className ? className : "mb-8 mt-8 bg-black-btn hover:bg-black-hover hover:text-white text-xl font-medium text-gray-bg-light"}
      `}
      onClick={onClick}
    >
      {isLoading ? <LoadingSpinner type="button"/> : name}
    </button>
  );
}

export default Button;