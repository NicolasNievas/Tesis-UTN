

const AboutUs = () => {
  return (
    <section className="relative h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={'/coffeebg.png'}
          alt="coffee background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 bg-white p-5 rounded-lg shadow-lg text-center max-w-3xl w-full">
        <h2 className="text-2xl mb-2">About us</h2>
        <p className="text-base leading-6">
          At Coffee Craze, we are passionate about delivering the finest coffee experience to our customers.
          Our mission is to offer a diverse range of high-quality products, ensuring every sip brings satisfaction.
          With a commitment to excellence, we aim to make every coffee moment special.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;