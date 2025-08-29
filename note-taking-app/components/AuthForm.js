import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Email OTP sign-in
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setMessage(error.message);
  };

  return (
    <div>
      <form onSubmit={handleEmailSignIn}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Sign in with Email OTP</button>
      </form>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      {message && <p>{message}</p>}
    </div>
  );
}