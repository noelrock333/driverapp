import React, { Component } from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import { Icon, Item, Input, Button, Text } from 'native-base';
import { Subscribe } from 'unstated';
import sessionState from '../../states/session';
import AuthLayout from '../Layouts/AuthLayout';

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center'
  },
  errorsContainer:{
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30
  },
  errorsIcon: {
    color: '#B72A2A',
    marginRight: 15
  },
  errors: {
    color: '#B72A2A',
    fontSize: 15
  },
  form: {
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  item: {
    borderBottomWidth: 0.5,
    borderColor: 'gray'
  },
  icon: {
    color: '#1F120D'
  },
  input: {
    textAlign: 'center',
    color: '#1F120D'
  },
  forgotPasswordButtonWrapper: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#1F120D',
    textDecorationLine: 'underline'
  },
  loginButtonWrapper: {
    margin: 40
  },
  loginButton: {
    backgroundColor: '#1F120D',
    borderRadius: 0
  },
  loginButtonText: {
    color: '#E3C463',
    fontWeight: '500'
  },
  createAccountWrapper: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  createAccountText: {
    color: '#1F120D'
  },
  createAccountLink: {
    color: '#1F120D',
    textDecorationLine: 'underline'
  }
});

export default class Login extends Component {
  state = {
    email: '',
    password: '',
    hidePassword: true
  }

  renderErrors = (errors) => {
    return errors.map((error, i) => {
      return <Text key={i} style={styles.errors}>{error.message}</Text>
    });
  }

  render(){
    return(
      <Subscribe to={[sessionState]}>
        {(session) => (
          <AuthLayout>
            {session.state.loginErrors &&
              <View style={styles.errorsContainer}>
                <Icon active name="md-alert" style={styles.errorsIcon} />
                {this.renderErrors(session.state.loginErrors)}
              </View>
            }
            <View style={styles.form}>
              <Item style={styles.item}>
                <Icon active name="mail" style={styles.icon} />
                <Input
                  placeholder="Correo electrónico"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={email => this.setState({ email })}
                  value={this.state.email}
                  placeholderTextColor="#1F120D"
                  style={styles.input}
                />
                <View style={{paddingHorizontal: 15}}></View>
              </Item>
              <Item style={styles.item}>
                <Icon active name="lock" style={styles.icon} />
                <Input
                  placeholder="Contraseña"
                  secureTextEntry={this.state.hidePassword}
                  onChangeText={password => this.setState({ password })}
                  value={this.state.password}
                  placeholderTextColor="#1F120D"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => this.setState({ hidePassword: !this.state.hidePassword })}>
                  <Icon active name="eye" style={styles.icon} />
                </TouchableOpacity>
              </Item>
            </View>

            <View style={styles.forgotPasswordButtonWrapper}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangePassword')}>
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.loginButtonWrapper} >
              <Button
                block
                style={styles.loginButton}
                onPress={() => session.login(this.state.email, this.state.password)}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </Button>
            </View>

            <View style={styles.createAccountWrapper}>
              <Text style={styles.createAccountText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Signup')}>
                <Text style={styles.createAccountLink}>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>
          </AuthLayout>
        )}
      </Subscribe>
    )
  }
}

