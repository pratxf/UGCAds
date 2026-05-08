"use client";

import { useEffect, useState } from "react";

export type LibraryCategory = { id: string; name: string; slug: string };
export type LibraryItem = {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categoryId: string | null;
};

export function useProductAdAvatars() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/product-ad-avatars")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        // Adapt to LibraryItem shape so the existing UI works unchanged.
        const adapted: LibraryItem[] = (data.avatars || []).map(
          (a: { id: string; name: string; imageUrl: string; gender: string }) => ({
            id: a.id,
            name: a.name,
            imageUrl: a.imageUrl,
            categoryId: a.gender, // we'll use gender as the category
          }),
        );
        setItems(adapted);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading };
}

export function useAvatars() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/avatars")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setItems(data.avatars || []);
        setCategories(data.categories || []);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { items, categories, loading };
}

export type Voice = {
  id: string;
  name: string;
  gender: "male" | "female";
  voiceId: string;
  previewUrl: string;
  descriptor: string;
};

export function useVoices() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [female, setFemale] = useState<Voice[]>([]);
  const [male, setMale] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/voices")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setVoices(d.voices || []);
        setFemale(d.female || []);
        setMale(d.male || []);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { voices, female, male, loading };
}

export function usePhotoshootTemplates() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/photoshoot-templates")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setItems(data.templates || []);
        setCategories(data.categories || []);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { items, categories, loading };
}
