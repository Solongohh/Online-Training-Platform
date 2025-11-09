import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Users, Award, BookOpen, TrendingUp, Globe } from "lucide-react";

export default function About() {
  const { language } = useLanguage();

  const values = [
    {
      icon: Target,
      titleEn: "Our Mission",
      titleMn: "Бидний эрхэм зорилго",
      descriptionEn: "To empower individuals and organizations through high-quality training programs that drive professional growth and business success.",
      descriptionMn: "Мэргэжлийн өсөлт, бизнесийн амжилтад хүргэх өндөр чанартай сургалтын хөтөлбөрүүдээр хувь хүн болон байгууллагуудыг хөгжүүлэх."
    },
    {
      icon: Users,
      titleEn: "Expert Trainers",
      titleMn: "Мэргэжлийн багш нар",
      descriptionEn: "Our trainers are industry professionals with years of real-world experience, bringing practical knowledge to every session.",
      descriptionMn: "Манай багш нар салбартаа олон жил ажилласан туршлагатай, практик мэдлэгээ хичээл бүрт авчирдаг мэргэжилтнүүд юм."
    },
    {
      icon: Award,
      titleEn: "Quality Content",
      titleMn: "Чанартай контент",
      descriptionEn: "All our training materials are carefully curated and regularly updated to ensure relevance and effectiveness.",
      descriptionMn: "Бүх сургалтын материалууд нь хамаарал, үр дүнтэй байхын тулд анхааралтай сонгож, тогтмол шинэчилдэг."
    },
    {
      icon: BookOpen,
      titleEn: "Flexible Learning",
      titleMn: "Уян хатан суралцах",
      descriptionEn: "Access courses anytime, anywhere, and learn at your own pace with our comprehensive online platform.",
      descriptionMn: "Өөрийн хувь хуваарийн дагуу хаанаас ч, хэзээ ч манай иж бүрэн онлайн платформоор дамжуулан сургалтанд хамрагдаарай."
    },
    {
      icon: TrendingUp,
      titleEn: "Career Growth",
      titleMn: "Карьерын өсөлт",
      descriptionEn: "Develop skills that matter and advance your career with industry-recognized certifications and practical knowledge.",
      descriptionMn: "Чухал ур чадвар эзэмшиж, салбартаа хүлээн зөвшөөрөгдсөн гэрчилгээ, практик мэдлэгээр карьераа дээшлүүлээрэй."
    },
    {
      icon: Globe,
      titleEn: "Global Standards",
      titleMn: "Олон улсын стандарт",
      descriptionEn: "Our programs meet international standards while being tailored to the local context and needs.",
      descriptionMn: "Манай хөтөлбөрүүд олон улсын стандартад нийцэж, орон нутгийн нөхцөл байдал, хэрэгцээнд тохирсон байдаг."
    }
  ];

  const stats = [
    { number: "15+", labelEn: "Years Experience", labelMn: "Жилийн туршлага" },
    { number: "500+", labelEn: "Training Programs", labelMn: "Сургалтын хөтөлбөр" },
    { number: "10,000+", labelEn: "Students Trained", labelMn: "Суралцагчид" },
    { number: "98%", labelEn: "Satisfaction Rate", labelMn: "Сэтгэл ханамжийн түвшин" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            {language === 'mn' ? 'Бидний тухай' : 'About Us'}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            {language === 'mn' 
              ? 'Maker Education буюу Хийгч Боловсрол'
              : 'Maker Education'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {language === 'mn'
              ? 'Бид Монгол Улсад хувь хүн болон байгууллагуудын мэргэжлийн хөгжилд дэмжлэг үзүүлдэг тэргүүлэгч сургалтын төв юм. Манай зорилго бол өндөр чанартай, практик суурьтай сургалтуудаар чанарын өөрчлөлт авчрах явдал.'
              : 'We are a leading training center in Mongolia, supporting the professional development of individuals and organizations. Our goal is to bring transformative change through high-quality, practice-based training programs.'}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-slide-in-right">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover-scale">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'mn' ? stat.labelMn : stat.labelEn}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === 'mn' ? 'Бидний үнэт зүйлс' : 'Our Values'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {language === 'mn' ? value.titleMn : value.titleEn}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'mn' ? value.descriptionMn : value.descriptionEn}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <Card className="mb-16 border-primary/20 shadow-elegant animate-fade-in">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">
              {language === 'mn' ? 'Бидний түүх' : 'Our Story'}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {language === 'mn'
                  ? 'Maker Education нь 2008 онд байгуулагдсан бөгөөд Монгол Улсын бизнес, боловсролын салбарт шинэ санааг авчрах зорилготой байгуулагдсан юм. Анх "Maker Project" хэмээх нэртэй байсан бөгөөд хүүхдүүдэд зориулсан STEAM боловсролын төслүүдийг хэрэгжүүлэхээр эхэлсэн.'
                  : 'Maker Education was founded in 2008 with the goal of bringing new ideas to the business and education sectors in Mongolia. Originally named "Maker Project," it began by implementing STEAM education projects for children.'}
              </p>
              <p>
                {language === 'mn'
                  ? 'Жилүүдийн турш бид үйл ажиллагаагаа өргөжүүлж, одоо бид хувь хүн болон байгууллагуудад зориулсан өргөн хүрээний мэргэжлийн хөгжлийн сургалтуудыг санал болгож байна. Бидний багш нар салбартаа мэргэшсэн, олон улсын туршлагатай мэргэжилтнүүд бөгөөд суралцагчдад зөвхөн онол биш, харин практик мэдлэг, ур чадвар олгоход анхаарч ажилладаг.'
                  : 'Over the years, we have expanded our operations and now offer a wide range of professional development training programs for individuals and organizations. Our instructors are industry specialists with international experience who focus on providing learners with not just theory, but practical knowledge and skills.'}
              </p>
              <p>
                {language === 'mn'
                  ? 'Өнөөдөр Maker Education нь 10,000 гаруй суралцагчид сургалт явуулж, Монгол Улсын хөгжилд хувь нэмрээ оруулсан байна. Бид үргэлж сургалтын шинэ арга, технологи нэвтрүүлж, суралцагчдын хэрэгцээнд нийцсэн хөтөлбөрүүдийг хөгжүүлэхээр тууштай байдаг.'
                  : 'Today, Maker Education has trained over 10,000 learners and contributed to the development of Mongolia. We are committed to always introducing new training methods and technologies, developing programs that meet the needs of our learners.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-hero text-primary-foreground">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'mn' 
                ? 'Өөрийн хөгжлийн аялалаа эхлүүлээрэй'
                : 'Start Your Development Journey'}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {language === 'mn'
                ? 'Манай сургалтуудад бүртгүүлж, мэргэжлийн чадвараа дээшлүүлээрэй'
                : 'Enroll in our training programs and enhance your professional skills'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a 
                href="/trainings"
                className="inline-flex items-center justify-center rounded-md bg-white text-primary px-8 py-3 font-medium hover:bg-white/90 transition-colors"
              >
                {language === 'mn' ? 'Сургалтууд үзэх' : 'View Trainings'}
              </a>
              <a 
                href="/auth"
                className="inline-flex items-center justify-center rounded-md border-2 border-white text-white px-8 py-3 font-medium hover:bg-white/10 transition-colors"
              >
                {language === 'mn' ? 'Бүртгүүлэх' : 'Sign Up'}
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
