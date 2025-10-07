import logo from '../../../assets/logo_new.svg';

export const Logo = ({ className = "", width = 120, height = "auto", alt = "Logo" }) => {
    return (
        <img
            className={`logo ${className}`}
            src={logo}
            alt={alt}
            width={width}
            height={height}
        />
    );
};
