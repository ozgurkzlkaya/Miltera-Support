/**
 * Miltera Fixlog Frontend - Ana Sayfa
 * 
 * Bu dosya, uygulamanın ana giriş noktasıdır.
 * Kullanıcılar ana URL'ye geldiğinde otomatik olarak dashboard'a yönlendirilir.
 * 
 * Özellikler:
 * - Server-side redirect
 * - Dashboard'a otomatik yönlendirme
 * - SEO dostu yapı
 * 
 * URL: /
 * Redirect: /dashboard
 */

import { redirect } from "next/navigation";

/**
 * Ana Sayfa Component
 * 
 * Bu component:
 * 1. Kullanıcıyı ana URL'den dashboard'a yönlendirir
 * 2. Server-side redirect kullanır (SEO dostu)
 * 3. Landing page yerine direkt dashboard'a gider
 */
const HomePage = async () => {
  // Kullanıcıyı direkt dashboard'a yönlendir
  // Bu sayede ana URL'ye gelen kullanıcılar hemen dashboard'ı görür
  redirect("/dashboard");
};

export default HomePage;
