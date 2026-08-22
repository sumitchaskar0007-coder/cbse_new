import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { blogAPI } from "../api";
import "../styles/blog.css";

const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
const imageUrl = (image) => image ? `${baseUrl}${image}` : "";
const readTime = (html) => Math.max(1, Math.ceil((html || "").replace(/<[^>]*>/g, "").split(/\s+/).length / 220));

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null); const [error, setError] = useState(false);
  useEffect(() => { blogAPI.getBySlug(slug).then(({ data }) => setBlog(data)).catch(() => setError(true)); }, [slug]);
  useEffect(() => { const update = () => { const h = document.documentElement.scrollHeight - innerHeight; document.documentElement.style.setProperty("--reading-progress", `${h > 0 ? (scrollY / h) * 100 : 0}%`); }; addEventListener("scroll", update, { passive: true }); update(); return () => removeEventListener("scroll", update); }, []);
  if (error) return <div className="blog-status">This article could not be found.</div>;
  if (!blog) return <div className="blog-status">Loading article…</div>;
  const url = `${window.location.origin}/blog/${blog.slug}`;
  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.description.replace(/<[^>]*>/g, "").slice(0, 155);
  return <><Helmet><title>{title} | Jadhavar International School</title><meta name="description" content={description} /><link rel="canonical" href={url} /></Helmet><div className="reading-progress" /><article className="medium-article"><Link className="article-back" to="/blog">← All articles</Link><header className="article-header"><p className="article-kicker">Jadhavar Journal</p><h1>{blog.title}</h1><div className="article-meta"><span>{blog.author || "Jadhavar International School"}</span><span>·</span><time>{new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time><span>·</span><span>{readTime(blog.description)} min read</span></div></header>{blog.image && <figure className="article-figure"><img src={imageUrl(blog.image)} alt={blog.imageAlt || blog.title} />{blog.imageAlt && <figcaption>{blog.imageAlt}</figcaption>}</figure>}<div className="article-layout"><aside className="share-tools"><a href={`https://wa.me/?text=${encodeURIComponent(`${blog.title} ${url}`)}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">LinkedIn</a></aside><div className="article-content ql-editor" dangerouslySetInnerHTML={{ __html: blog.description }} /></div><section className="article-cta"><h2>Ready to see learning come alive?</h2><p>Visit Jadhavar International School and discover a supportive space for your child.</p><div><Link to="/admissions">Book a School Visit</Link><Link to="/contact" className="cta-secondary">Enquire Now</Link></div></section></article></>;
}
