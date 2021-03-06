import React from 'react';
import { View, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Button, Text, Container, Content, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import openMap from 'react-native-open-maps';
import mapsIcon from '../../assets/maps-icon.png';
import Header from '../shared/Header';
import Api from '../../utils/api';
import styles from './style';
import Loading from '../Loading';
import Modal from '../Modal';
import firebase from 'react-native-firebase';
import call from 'react-native-phone-call';

let dbRef = firebase.database().ref('server/taken_trips/');

class Trip extends React.Component {
  state = {
    id: null,
    address: '',
    since: '',
    full_name: '',
    refreshing: false,
    status: '',
    isWaiting: false,
    errors: [],
    modalVisible: false
  };

  componentDidMount() {
    this.getActiveTrip();
  }

  componentWillUnmount() {
    dbRef.off('child_removed');
  }

  monitorTrip = () => {
    let { id } = this.state;
    dbRef.child(`${id}`).on('child_removed', snapshot => {
      if (snapshot.key == 'id') {
        this.props.setStatus('free');
      }
    });
  };

  getActiveTrip = () => {
    // this.setState({ refreshing: true });

    Api.get('/drivers/active_trip')
      .then(res => {
        this.setState(
          {
            refreshing: false,
            id: res.data.trip.id,
            address: res.data.trip.address_origin,
            since: '00:06',
            latitude: res.data.trip.lat_origin,
            longitude: res.data.trip.lng_origin,
            full_name: res.data.trip.user.full_name,
            phone_number: res.data.trip.user.phone_number,
            references: res.data.trip.references
          },
          this.monitorTrip
        );
        console.log(res.data)
      })
      .catch(err => {
        console.log(err.response);
        alert('No se pudo obtener la informacion del servicio');
      });
  };

  handleFinish = () => {
    Alert.alert(
      'Finalizar',
      '¿Está seguro que desea finalizar el servicio?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Si', onPress: () => this.finishTrip() }
      ],
      { cancelable: false }
    );
  }

  finishTrip = () => {
    this.setState({ isWaiting: true });
    Api.put('/drivers/finish_trip')
      .then(res => {
        this.setState({ isWaiting: false });
        if (res.status == 200) {
          // Take a look at this
          this.props.setStatus('free');
        } else {
          console.log(res);
        }
      })
      .catch(err => {
        this.setState({
          errors: err.response.data.errors,
          modalVisible: true
        });
      });
  };

  handleNotify = () => {
    Alert.alert(
      'Notificar',
      '¿Has llegado al domicilio?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Si', onPress: () => this.notifyUser() }
      ],
      { cancelable: false }
    );
  }
  
  notifyUser = () => {
    Api.put('/drivers/notify_user')
      .then(res => {
        if (res.status == 200) {
          alert('Has enviado una notificacion al usuario');
        } else {
          alert('Vuelve a intentar');
        }
      })
      .catch(err => {
        alert('Vuelve a intentar');
      });
  }

  cancelTrip = () => {
    Alert.alert(
      'Cancelar',
      '¿Está seguro que desea cancelar el servicio?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Si', onPress: () => this.cancelTripDB() }
      ],
      { cancelable: false }
    );
  };

  cancelTripDB = () => {
    this.setState({ isWaiting: true });
    Api.put('/drivers/cancel_trip')
      .then(res => {
        this.setState({ isWaiting: false });
        this.props.setStatus('free');
      })
      .catch(err => {
        this.setState({
          isWaiting: false,
          errors: err.response.data.errors,
          modalVisible: true
        });
      });
  };

  setModalVisible = visible => {
    this.setState({
      modalVisible: visible,
      errors: visible ? this.state.errors : []
    });
  };

  showMap = () => {
    const { latitude, longitude, address } = this.state;
    openMap({ latitude, longitude, zoom: 30, query: address });
  };

  makeCall = () => {
    let { phone_number } = this.state;
    const args = {
      number: phone_number,
      prompt: false
    };
    call(args).catch(err => alert(err));
  }

  render() {
    const { address, since, full_name, references, phone_number } = this.state;
    const { status } = this.props;
    const headerProps = {
      status,
      navigation: this.props.navigation,
      cancelTrip: this.cancelTrip
    };
    return (
      <Container contentContainerStyle={{ flex: 1 }}>
        {this.state.isWaiting && <Loading />}
        <Header {...headerProps} />
        <KeyboardAwareScrollView style={{ height: '100%' }}>
          <Modal
            errors={this.state.errors}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />

          <View style={styles.darkFieldWrapper}>
            <Text style={styles.label}>Usuario:</Text>
            <View style={styles.userWrapper}>
              <Text style={styles.text}>{full_name}</Text>
              <Button onPress={this.handleNotify} danger>
                <Icon name="ios-notifications" />
              </Button>
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Dirección:</Text>
            <View style={styles.directionWrapper}>
              <Text style={styles.textDirection}>{address}</Text>
              <TouchableOpacity
                onPress={this.showMap}
                style={styles.mapImageWrapper}
              >
                <Image style={styles.mapImage} source={mapsIcon} />
              </TouchableOpacity>
            </View>
          </View>
          {(references !== '' && typeof references == 'string')  &&
            <View style={styles.darkFieldWrapper}>
              <Text style={styles.label}>Indicaciones:</Text>
              <View>
                <Text style={styles.text}>{references}</Text>
              </View>
            </View>
          }

          {(phone_number !== '' && typeof phone_number == 'string') &&
            <View style={styles.callUserWrapper}>
              <Button style={styles.callUserButton} onPress={this.makeCall}>
                <Icon name="ios-call" style={styles.phoneIcon} />
                <Text style={styles.callText}>Llamar al pasajero</Text>
              </Button>
            </View>
          }

          {status == 'active' && (
            <View style={styles.buttonWrapper}>
              <Button
                large
                full
                style={styles.finishButton}
                onPress={this.handleFinish}
              >
                <Text style={styles.finishButtonText}>Finalizar servicio</Text>
              </Button>
            </View>
          )}
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

export default Trip;
