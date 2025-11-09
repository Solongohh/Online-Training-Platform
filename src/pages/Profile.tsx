import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User } from "lucide-react";

interface ProfileData {
  full_name: string;
  bio: string;
  bio_mn: string;
  professional_title: string;
  professional_title_mn: string;
  years_of_experience: number;
  avatar_url: string | null;
}

export default function Profile() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    bio: "",
    bio_mn: "",
    professional_title: "",
    professional_title_mn: "",
    years_of_experience: 0,
    avatar_url: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          bio_mn: data.bio_mn || "",
          professional_title: data.professional_title || "",
          professional_title_mn: data.professional_title_mn || "",
          years_of_experience: data.years_of_experience || 0,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Error" : "Алдаа",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: language === "en" ? "File too large" : "Файл хэт том",
          description: language === "en" 
            ? "Please upload an image smaller than 2MB" 
            : "2MB-аас бага зураг оруулна уу",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: language === "en" ? "Invalid file type" : "Буруу файлын төрөл",
          description: language === "en" 
            ? "Please upload an image file" 
            : "Зураг файл оруулна уу",
        });
        return;
      }

      setUploading(true);

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${user?.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: language === "en" ? "Success" : "Амжилттай",
        description: language === "en" 
          ? "Avatar updated successfully" 
          : "Зураг амжилттай шинэчлэгдлээ",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Error" : "Алдаа",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          bio_mn: profile.bio_mn,
          professional_title: profile.professional_title,
          professional_title_mn: profile.professional_title_mn,
          years_of_experience: profile.years_of_experience,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: language === "en" ? "Success" : "Амжилттай",
        description: language === "en" 
          ? "Profile updated successfully" 
          : "Профайл амжилттай шинэчлэгдлээ",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Error" : "Алдаа",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {language === "en" ? "Edit Profile" : "Профайл засах"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "Profile Picture" : "Профайл зураг"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center gap-2">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <Label htmlFor="avatar">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById("avatar")?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {language === "en" ? "Upload Photo" : "Зураг оруулах"}
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" 
                      ? "Maximum size: 2MB. Supported formats: JPG, PNG, WEBP" 
                      : "Хамгийн их хэмжээ: 2MB. Дэмжигдсэн форматууд: JPG, PNG, WEBP"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "Basic Information" : "Үндсэн мэдээлэл"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name">
                    {language === "en" ? "Full Name" : "Бүтэн нэр"}
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={language === "en" ? "Enter your full name" : "Бүтэн нэрээ оруулна уу"}
                  />
                </div>

                <div>
                  <Label htmlFor="professional_title">
                    {language === "en" ? "Professional Title (English)" : "Мэргэжлийн гарчиг (Англи)"}
                  </Label>
                  <Input
                    id="professional_title"
                    value={profile.professional_title}
                    onChange={(e) => setProfile({ ...profile, professional_title: e.target.value })}
                    placeholder={language === "en" ? "e.g., Senior Software Engineer" : "жишээ нь: Ахлах программ хангамжийн инженер"}
                  />
                </div>

                <div>
                  <Label htmlFor="professional_title_mn">
                    {language === "en" ? "Professional Title (Mongolian)" : "Мэргэжлийн гарчиг (Монгол)"}
                  </Label>
                  <Input
                    id="professional_title_mn"
                    value={profile.professional_title_mn}
                    onChange={(e) => setProfile({ ...profile, professional_title_mn: e.target.value })}
                    placeholder={language === "en" ? "e.g., Ахлах программ хангамжийн инженер" : "жишээ нь: Ахлах программ хангамжийн инженер"}
                  />
                </div>

                <div>
                  <Label htmlFor="years_of_experience">
                    {language === "en" ? "Years of Experience" : "Ажилласан жил"}
                  </Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    min="0"
                    value={profile.years_of_experience}
                    onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "Biography" : "Танилцуулга"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">
                    {language === "en" ? "Bio (English)" : "Танилцуулга (Англи)"}
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder={language === "en" ? "Tell us about yourself..." : "Өөрийнхөө тухай хэлнэ үү..."}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="bio_mn">
                    {language === "en" ? "Bio (Mongolian)" : "Танилцуулга (Монгол)"}
                  </Label>
                  <Textarea
                    id="bio_mn"
                    value={profile.bio_mn}
                    onChange={(e) => setProfile({ ...profile, bio_mn: e.target.value })}
                    placeholder={language === "en" ? "Өөрийнхөө тухай хэлнэ үү..." : "Өөрийнхөө тухай хэлнэ үү..."}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {language === "en" ? "Save Changes" : "Хадгалах"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                {language === "en" ? "Cancel" : "Цуцлах"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
