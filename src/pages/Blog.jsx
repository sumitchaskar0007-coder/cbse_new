import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { blogAPI } from "../api";
import "../styles/blog.css";
const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
const plainText = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
export default function Blog() {
  const [blogs, setBlogs] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { blogAPI.getAll().then(({ data }) => setBlogs(data)).finally(() => setLoading(false)); }, []);
  return <main className="blog-index"><Helmet><title>School Insights & Articles | Jadhavar International School</title><meta name="description" content="Practical school and parenting insights from Jadhavar International School." /></Helmet><p className="article-kicker">Jadhavar Journal</p><h1>Ideas for thoughtful parents</h1><p className="blog-intro">Helpful perspectives on education, childhood and choosing the right path for your child.</p>{loading ? <p>Loading articles…</p> : <div className="blog-list">{blogs.map((blog) => <Link className="blog-card" to={`/blog/${blog.slug || blog._id}`} key={blog._id}>{blog.image && <img src={`${baseUrl}${blog.image}`} alt={blog.imageAlt || blog.title} />}<div><p className="article-kicker">{new Date(blog.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p><h2>{blog.title}</h2><p>{plainText(blog.description).slice(0, 180)}{plainText(blog.description).length > 180 ? "…" : ""}</p><span>Read article →</span></div></Link>)}</div>}</main>;
}
