import AiTools from '../components/home/AiTools';
import Footer from '../components/home/Footer';
import Hero from '../components/home/Hero';
import Navbar from '../components/home/Navbar';
import Plan from '../components/home/Plan';
import { Testimonials } from '../components/home/Testimonials';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <AiTools />
      <Testimonials />
      <Plan />
      <Footer />
    </>
  );
};

export default Home;
