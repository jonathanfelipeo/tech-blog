import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { user, signIn, signOut } = useAuth();
  const [role, setRole] = useState<LoginRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const showMessage = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Preencha e-mail e senha.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(role, email.trim(), password);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Falha ao autenticar. Verifique suas credenciais.';
      setErrorMsg(msg);
      showMessage('Erro de Autenticação', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.badge}>
            {user.role === 'teacher' ? 'MODO PROFESSOR' : 'MODO ALUNO'}
          </Text>
          <Text style={styles.title}>Olá, {user.name}!</Text>
          <Text style={styles.info}>E-mail: {user.email}</Text>
          {user.subject ? <Text style={styles.info}>Disciplina: {user.subject}</Text> : null}

          <Text style={styles.permissionInfo}>
            {user.role === 'teacher'
              ? 'Você pode gerenciar postagens, professores e alunos.'
              : 'Você pode visualizar postagens e comentar enquanto estiver conectado.'}
          </Text>

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.buttonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Visitantes podem ler os posts. Entre como aluno ou professor para comentar.
        </Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <Text style={styles.label}>Perfil</Text>
        <View style={styles.roleChoices}>
          {(['student', 'teacher'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.roleButton, role === option && styles.roleButtonSelected]}
              onPress={() => setRole(option)}
            >
              <Text style={[styles.roleButtonText, role === option && styles.roleButtonTextSelected]}>
                {option === 'student' ? 'Aluno' : 'Professor'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              Entrar como {role === 'student' ? 'Aluno' : 'Professor'}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 20,
  },
  info: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  permissionInfo: {
    fontSize: 14,
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  roleChoices: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  roleButtonTextSelected: {
    color: '#1D4ED8',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 14,
  },
});