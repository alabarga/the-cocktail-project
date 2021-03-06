import React, { Component } from 'react';
import  { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import GoogleMapReact from 'google-map-react';
import Home from './components/Home';

const madridCoors= {
  lat: 40.41,
  lng: -3.70
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stopsBus: [],
      datafetch: false,
      loading: false,
      currentPage: 1,
      elementsPerPage: 6,
      center: madridCoors,
      zoom: 15,
      hidden: true,
      selectedStop: null,
      currentCard: null,
      street : '',
      latSearch : '',
      lngSearch: ''
    };
    this.onChange = (street) => this.setState({ street });
  }

  setCurrentPage = numberpage => {
    this.setState({
      currentPage: numberpage
    });
  }

  setCurrentStop = stopId => {
    this.setState({
      selectedStop: stopId
    });
  }

  fetchInfoBuses = (latitude,longitude) => {
    const radius = 500;
    const idClient = "WEB.SERV.redlim@gmail.com";
    const passKey = "FB5B0E17-88EB-407E-A222-97F0916E0C41";
    const urlGetStopsFromXY = "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/geo/GetStopsFromXY.php";
    this.setState({
      loading : false,
      stopsBus: [],
    });

    fetch(urlGetStopsFromXY, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body:
      "idClient="+idClient+"&passKey="+passKey+"&latitude="+latitude+"&longitude="+longitude+"&Radius="+radius,
    }).then(response => {
      return response.json();
    }).then(data => {
      this.setState({
        stopsBus: data.stop || [],
        loading : true,
        datafetch: true,
        hidden: false,
        selectedStop: data.stop ? data.stop[0].stopId : null
      });
    })
  }

  handleClickCoord = (latitudeCoord, longitudeCoord) => {
    this.fetchInfoBuses(latitudeCoord,longitudeCoord);
    this.setState({
      center:{lat:latitudeCoord, lng:longitudeCoord},
      zoom: 15,
      hidden: false,
    });
    return (
      <GoogleMapReact
        center={this.state.center}
        zoom={this.state.zoom}
      />
    )
  }

  handleClickShowSearcher = () => {
    this.setState({
      hidden : !this.state.hidden,
    });
  }

  handleClickStreetSearcher = (event) => {
    event.preventDefault()

    geocodeByAddress(this.state.street)
    .then(results => getLatLng(results[0]))
    .then(latLng => {
      this.setState({
        latSearch : latLng.lat,
        lngSearch : latLng.lng
      })

      let latitudSearch = this.state.latSearch;
      let longitudeSearch = this.state.lngSearch;
      this.fetchInfoBuses(latitudSearch,longitudeSearch);
      this.setState({
        center:{lat:latitudSearch, lng:longitudeSearch},
        zoom: 15,
        hidden: false
      });
    })
      .catch(error => console.error('Error', error));
  }

  render() {

    return (
      <Home
        state = {this.state}
        handleClick= {this.handleClickCoord}
        handleClickShowSearcher= {this.handleClickShowSearcher}
        handleClickStreetSearcher= {this.handleClickStreetSearcher}
        onChange = {this.onChange}
        defaultCenter = {this.props.center}
        defaultZoom = {this.props.zoom}
        setCurrentStop = {this.setCurrentStop}
        setCurrentPage= {this.setCurrentPage}
      />
    );
  }
}

App.defaultProps= {
  center: madridCoors,
  zoom: 12
};

export default App;
