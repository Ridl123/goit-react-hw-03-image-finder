import { Component } from 'react';
import * as API from '../../services/PixabayApi';
import SearchBar from '../SearchBar/SearchBar';
import ImageGallery from '../ImageGallery/ImageGallery';
import Loader from '../Loader/Loader';
import Button from '../Button/Button';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  // Setarea stării inițiale
  state = {
    searchName: '', // Stochează interogarea de căutare
    images: [], // Stochează imaginile descărcate
    currentPage: 1, // Stochează numărul actual al paginii
    error: null, // Stochează mesajul de eroare
    isLoading: false, // Indicator de încărcare a imaginii
    totalPages: 0, // Stochează numărul total de pagini
  };

  // Metoda ciclului de viață: apelată când componenta este actualizată
  componentDidUpdate(_, prevState) {
    // Verificați dacă cererea sau numărul paginii s-a schimbat
    if (
      prevState.searchName !== this.state.searchName ||
      prevState.currentPage !== this.state.currentPage
    ) {
      this.addImages(); // Obține și adaugă imagini la stare
    }
  }

  // Metodă de încărcare a imaginilor suplimentare prin creșterea numărului paginii curente
  loadMore = () => {
    this.setState(prevState => ({
      currentPage: prevState.currentPage + 1,
    }));
  };

  // Metoda de procesare a trimiterii formularului de căutare
  handleSubmit = query => {
    this.setState({
      searchName: query, // Setați cererea introdusă la starea
      images: [], // Ștergeți matricea cu imagini
      currentPage: 1, // Resetează numărul paginii curente la prima
    });
  };

  // Metodă pentru obținerea și adăugarea de imagini în stare
  addImages = async () => {
    const { searchName, currentPage } = this.state;
    try {
      this.setState({ isLoading: true }); // Setați indicatorul de încărcare

      // Primiți date folosind cererea API către Pixabay
      const data = await API.getImages(searchName, currentPage);

      if (data.hits.length === 0) {
        // Dacă nu au fost găsite imagini, afișați un mesaj
        return toast.info('Sorry image not found...', {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      // Normalizează imaginile rezultate
      const normalizedImages = API.normalizedImages(data.hits);

      this.setState(state => ({
        images: [...state.images, ...normalizedImages], // Adăugați imagini noi la cele existente
        isLoading: false, // Resetează indicatorul de încărcare
        error: '', // Ștergeți mesajul de eroare
        totalPages: Math.ceil(data.totalHits / 12), // Calculați numărul total de pagini
      }));
    } catch (error) {
      this.setState({ error: 'Something went wrong!' }); // Dacă apare o eroare, afișați un mesaj
    } finally {
      this.setState({ isLoading: false }); // În orice caz, resetați indicatorul de încărcare
    }
  };

  render() {
    const { images, isLoading, currentPage, totalPages } = this.state;

    return (
      <div>
        <ToastContainer transition={Slide} />
        <SearchBar onSubmit={this.handleSubmit} />
        {images.length > 0 ? (
          <ImageGallery images={images} />
        ) : (
          <p
            style={{
              padding: 100,
              textAlign: 'center',
              fontSize: 30,
            }}
          >
            Image gallery is empty... 📷
          </p>
        )}
        {isLoading && <Loader />}
        {images.length > 0 && totalPages !== currentPage && !isLoading && (
          <Button onClick={this.loadMore} /> // Buton pentru a încărca imagini suplimentare
        )}
      </div>
    );
  }
}

export default App;
