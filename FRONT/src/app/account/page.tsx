const accountPage = () => {
    return(
        <div className="relative h-screen flex items-center justify-center">
        {/* Imagen de fondo */}
        <img
          src="/construccion.png"
          alt="En construcción"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

      </div>
    );
};

export default accountPage;