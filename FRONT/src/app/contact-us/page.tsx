const ContactUs = () => {
    return (
      <section className="relative h-[calc(100vh-80px)] flex items-center justify-center">

        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={'/coffeebg.png'} 
            alt="coffee background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-5 rounded-lg shadow-lg text-center max-w-3xl w-full">
          <h2 className="text-2xl mb-4">Contact Us</h2>
          <form className="flex flex-col space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="p-2 border border-gray-300 rounded-md bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="p-2 border border-gray-300 rounded-md bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={5}
              className="p-2 border border-gray-300 rounded-md bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              Send message
            </button>
          </form>
        </div>
      </section>
    );
  };
  
  export default ContactUs;
  