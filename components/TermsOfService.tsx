import React from 'react';

type Lang = 'az' | 'en' | 'ru' | 'tr';

interface TermsOfServiceProps {
  lang?: Lang;
  onBack: () => void;
}

const termsText: Record<Lang, string> = {
  az: `İstifadə Şərtləri
Son yenilənmə tarixi: 9 iyun 2026-cı il

Bu İstifadə Şərtləri volt.az internet saytından istifadə qaydalarını müəyyən edir. Sayta daxil olmaqla və ondan istifadə etməklə aşağıdakı şərtləri oxuduğunuzu, başa düşdüyünüzü və qəbul etdiyinizi təsdiq edirsiniz.

1. Ümumi müddəalar
volt.az Solarix tərəfindən təqdim olunan günəş enerjisi avadanlıqları, texniki həllər, layihələndirmə, təchizat, quraşdırma və əlaqəli xidmətlər haqqında məlumat platforması və rəsmi satış kanalıdır.
Saytda təqdim olunan məlumatlar ümumi məlumatlandırma məqsədi daşıyır. Müəyyən layihəyə uyğun məhsul seçimi, texniki hesablama, qiymətləndirmə və quraşdırma şərtləri ayrıca texniki araşdırma və kommersiya təklifi əsasında müəyyən edilir.

2. Saytdan istifadə
İstifadəçi saytdan yalnız qanuni məqsədlərlə istifadə etməlidir.
Aşağıdakılar qadağandır:
• saytın fəaliyyətinə müdaxilə etmək;
• zərərli proqram, virus və ya təhlükəli kod ötürmək;
• icazəsiz giriş əldə etməyə cəhd göstərmək;
• yanlış, aldadıcı və ya üçüncü şəxslərə aid məlumat təqdim etmək;
• saytdakı materiallardan qanunsuz kommersiya məqsədləri üçün istifadə etmək;
• müəlliflik və digər əqli mülkiyyət hüquqlarını pozmaq.

3. Məhsullar və texniki məlumatlar
Saytda göstərilən məhsul şəkilləri, texniki xüsusiyyətlər, ölçülər, səmərəlilik göstəriciləri, zəmanət məlumatları və digər təsvirlər istehsalçıların təqdim etdiyi məlumatlara əsaslana bilər.
Solarix məlumatların düzgün və aktual olmasına çalışır, lakin istehsalçı məhsulun dizaynını, texniki göstəricilərini, qablaşdırmasını və komplektasiyasını əvvəlcədən xəbərdarlıq etmədən dəyişə bilər.
Məhsulun layihəyə uyğunluğu sifarişdən əvvəl Solarix-in texniki mütəxəssisləri tərəfindən ayrıca qiymətləndirilə bilər.

4. Qiymətlər və mövcudluq
Saytda göstərilən qiymətlər məlumat xarakterli ola bilər və yekun kommersiya təklifi hesab edilmir.
Qiymətlər aşağıdakı amillərdən asılı olaraq dəyişə bilər:
• məhsulun mövcudluğu;
• sifariş miqdarı;
• valyuta məzənnəsi;
• çatdırılma və gömrük xərcləri;
• quraşdırma sahəsinin xüsusiyyətləri;
• əlavə materiallar və xidmətlər;
• vergi və digər qanuni ödənişlər.
Sifariş yalnız Solarix tərəfindən yazılı şəkildə təsdiqləndikdən və müvafiq müqavilə və ya hesab-faktura rəsmiləşdirildikdən sonra qəbul edilmiş hesab olunur.

5. Sifariş və ödəniş
İstifadəçi sifariş və ya sorğu göndərərkən düzgün və tam məlumat təqdim etməlidir.
Solarix aşağıdakı hallarda sifarişi qəbul etməmək və ya ləğv etmək hüququnu saxlayır:
• məhsul anbarda olmadıqda;
• qiymət və ya məhsul məlumatında açıq texniki səhv olduqda;
• ödəniş təsdiqlənmədikdə;
• sifarişin qanunvericiliyə zidd olduğu müəyyən edildikdə;
• müştəri yanlış və ya natamam məlumat təqdim etdikdə.
Ödəniş qaydaları, avans məbləği və ödəniş müddəti kommersiya təklifində, hesab-fakturada və ya müqavilədə göstərilir.

6. Çatdırılma və quraşdırma
Çatdırılma və quraşdırma müddətləri ilkin xarakter daşıya bilər. Gecikmələr logistika, gömrük, istehsal, hava şəraiti, dövlət icazələri, şəbəkəyə qoşulma prosedurları və Solarix-in nəzarətindən kənar digər səbəblərdən yarana bilər.
Quraşdırma işlərinin dəqiq həcmi, müddəti, məsuliyyət bölgüsü və qəbul proseduru ayrıca müqavilə ilə müəyyən edilir.

7. Zəmanət
Məhsullara tətbiq olunan zəmanət istehsalçının zəmanət şərtlərinə və Solarix ilə bağlanmış müqaviləyə əsasən müəyyən olunur.
Zəmanət aşağıdakı halları əhatə etməyə bilər:
• düzgün olmayan istifadə;
• icazəsiz müdaxilə və ya təmir;
• yanlış quraşdırma;
• mexaniki zədələnmə;
• elektrik şəbəkəsində normadan kənar gərginlik;
• təbii fəlakət və fors-major halları;
• istehsalçının təlimatlarına əməl edilməməsi.

8. Qaytarma və dəyişdirmə
Məhsulların qaytarılması və dəyişdirilməsi Azərbaycan Respublikasının qanunvericiliyinə, məhsulun vəziyyətinə, istehsalçının şərtlərinə və tərəflər arasında bağlanmış müqaviləyə uyğun həyata keçirilir.
Xüsusi sifarişlə gətirilmiş, istifadə olunmuş, quraşdırılmış, zədələnmiş və ya fərdi layihəyə uyğun hazırlanmış məhsullar qanunvericiliyin icazə verdiyi həddə qaytarılmaya bilər.

9. Əqli mülkiyyət
Saytdakı mətnlər, dizayn, loqotiplər, şəkillər, qrafiklər, kataloqlar, texniki materiallar və digər məzmun Solarix-ə və ya müvafiq hüquq sahiblərinə məxsusdur.
Yazılı icazə olmadan bu materialların surətinin çıxarılması, dəyişdirilməsi, yayımlanması, satılması və ya kommersiya məqsədilə istifadəsi qadağandır.

10. Üçüncü tərəf bağlantıları
Saytda istehsalçıların, tərəfdaşların və digər üçüncü şəxslərin internet səhifələrinə keçidlər ola bilər.
Solarix üçüncü tərəf saytlarının məzmununa, təhlükəsizliyinə, məxfilik siyasətinə və fəaliyyətinə görə məsuliyyət daşımır.

11. Məsuliyyətin məhdudlaşdırılması
Qanunvericiliyin icazə verdiyi həddə Solarix:
• saytdan istifadənin fasiləsiz və xətasız olacağına zəmanət vermir;
• saytdakı ümumi məlumatlara əsasən qəbul edilən texniki və maliyyə qərarlarına görə məsuliyyət daşımır;
• dolayı zərər, itirilmiş gəlir və ya məlumat itkisinə görə məsuliyyət daşımır.
Bu müddəalar istehlakçının qanunla qorunan hüquqlarını məhdudlaşdırmır.

12. Fərdi məlumatlar
Sayt vasitəsilə təqdim edilən şəxsi məlumatlar qüvvədə olan qanunvericiliyə və volt.az saytının Məxfilik Siyasətinə uyğun işlənilir.
İstifadəçi yalnız özünə aid və ya təqdim etməyə hüququ olan məlumatları göndərməlidir.

13. Şərtlərə dəyişikliklər
Solarix bu İstifadə Şərtlərini qanunvericilikdə, xidmətlərdə və ya saytın fəaliyyətində baş verən dəyişikliklərə uyğun olaraq yeniləyə bilər.
Yeni redaksiya saytda dərc edildiyi tarixdən qüvvəyə minir.

14. Tətbiq olunan hüquq və mübahisələr
Bu şərtlər Azərbaycan Respublikasının qanunvericiliyi ilə tənzimlənir.
Mübahisələr ilk növbədə danışıqlar yolu ilə həll edilməlidir. Razılıq əldə olunmadıqda mübahisə Azərbaycan Respublikasının səlahiyyətli məhkəmələrində həll edilir.

15. Əlaqə məlumatları
Solarix / volt.az
Ünvan: Bakı şəhəri, Kövkəb Səfərəliyeva küçəsi 16E, Time Business Center, 6-cı mərtəbə
Telefon: +994 50 418 00 01
E-poçt: support@volt.az
Veb-sayt: www.volt.az`,
  en: `Terms of Use
Last updated: 9 June 2026

These Terms of Use govern access to and use of the volt.az website. By accessing or using the website, you confirm that you have read, understood and accepted these Terms.

1. General provisions
volt.az is an information platform and official sales channel operated by Solarix for solar energy equipment, technical solutions, design, supply, installation and related services.
Information published on the website is provided for general informational purposes. Product selection, technical calculations, project pricing and installation requirements are determined separately following a technical assessment and a formal commercial proposal.

2. Use of the website
The website may be used only for lawful purposes.
Users must not:
• interfere with the operation or security of the website;
• transmit viruses, malware or harmful code;
• attempt to obtain unauthorised access;
• submit false, misleading or third-party information without authority;
• use website content for unlawful commercial purposes;
• violate copyright or other intellectual property rights.

3. Products and technical information
Product images, specifications, dimensions, efficiency ratings, warranty information and other descriptions may be based on information supplied by manufacturers.
Solarix takes reasonable steps to keep information accurate and current. However, manufacturers may change product designs, specifications, packaging or included components without prior notice.
Product suitability for a particular project may require a separate technical assessment by Solarix specialists.

4. Prices and availability
Prices displayed on the website may be indicative and do not necessarily constitute a final commercial offer.
Prices may change depending on product availability, order quantity, currency exchange rates, shipping and customs costs, installation-site conditions, additional materials and services, taxes and statutory charges.
An order is considered accepted only after written confirmation by Solarix and issuance of the relevant agreement, invoice or other formal order document.

5. Orders and payments
Users must provide complete and accurate information when submitting an order or enquiry.
Solarix may reject or cancel an order where the product is unavailable, there is an obvious pricing or technical error, payment has not been confirmed, the transaction would violate applicable law, or the customer has supplied false or incomplete information.
Payment terms, advance-payment requirements and payment deadlines are stated in the relevant quotation, invoice or agreement.

6. Delivery and installation
Delivery and installation dates may be estimates. Delays may occur due to logistics, customs procedures, manufacturing, weather conditions, government approvals, grid-connection procedures or other circumstances outside Solarix's reasonable control.
The exact installation scope, schedule, allocation of responsibilities and acceptance procedure are determined by a separate agreement.

7. Warranty
Applicable product warranties are governed by the manufacturer's warranty terms and the agreement concluded with Solarix.
A warranty may not cover improper use, unauthorised modification or repair, incorrect installation, mechanical damage, abnormal grid voltage, natural disasters or force majeure, or failure to follow manufacturer instructions.

8. Returns and exchanges
Returns and exchanges are handled in accordance with the laws of the Republic of Azerbaijan, the condition of the product, applicable manufacturer requirements and the agreement between the parties.
Custom-ordered, used, installed, damaged or project-specific products may be non-returnable to the extent permitted by law.

9. Intellectual property
Website texts, designs, logos, photographs, graphics, catalogues, technical materials and other content belong to Solarix or the relevant rights holders.
They may not be copied, modified, distributed, sold or used commercially without prior written permission.

10. Third-party links
The website may contain links to manufacturers, partners and other third-party websites.
Solarix is not responsible for the content, security, privacy practices or operation of third-party websites.

11. Limitation of liability
To the extent permitted by applicable law, Solarix does not guarantee uninterrupted or error-free website operation, is not responsible for technical or financial decisions made solely on the basis of general website information, and is not liable for indirect losses, loss of profit or loss of data.
Nothing in these Terms limits any mandatory consumer right granted by applicable law.

12. Personal data
Personal data submitted through the website is processed in accordance with applicable law and the volt.az Privacy Policy.
Users must submit only their own information or information they are legally authorised to provide.

13. Amendments
Solarix may update these Terms to reflect changes in legislation, services or website operation.
The revised Terms become effective when published on the website.

14. Governing law and disputes
These Terms are governed by the laws of the Republic of Azerbaijan.
Disputes should first be resolved through good-faith negotiations. Where no agreement can be reached, the dispute will be submitted to the competent courts of the Republic of Azerbaijan.

15. Contact information
Solarix / volt.az
Address: 16E Kovkab Safaraliyeva Street, Time Business Center, 6th Floor, Baku
Phone: +994 50 418 00 01
Email: support@volt.az
Website: www.volt.az`,
  ru: `Условия использования
Дата последнего обновления: 9 июня 2026 года

Настоящие Условия использования регулируют доступ к сайту volt.az и порядок его использования. Посещая или используя сайт, вы подтверждаете, что прочитали, поняли и приняли настоящие Условия.

1. Общие положения
volt.az является информационной платформой и официальным каналом продаж Solarix, представляющим оборудование для солнечной энергетики, технические решения, проектирование, поставку, монтаж и сопутствующие услуги.
Информация на сайте предоставляется в общих информационных целях. Подбор оборудования, технические расчёты, стоимость проекта и условия монтажа определяются отдельно после технической оценки и подготовки официального коммерческого предложения.

2. Использование сайта
Сайт разрешается использовать исключительно в законных целях.
Запрещается вмешиваться в работу или систему безопасности сайта, распространять вирусы или опасный код, пытаться получить несанкционированный доступ, предоставлять ложные или чужие данные без полномочий, незаконно использовать материалы сайта в коммерческих целях, нарушать авторские и иные права интеллектуальной собственности.

3. Товары и техническая информация
Фотографии, характеристики, размеры, показатели эффективности, сведения о гарантии и другие описания товаров могут основываться на информации, предоставленной производителями.
Solarix принимает разумные меры для поддержания точности и актуальности информации. При этом производители могут изменять дизайн, технические характеристики, упаковку и комплектацию продукции без предварительного уведомления.
Соответствие оборудования конкретному проекту может потребовать отдельной оценки специалистами Solarix.

4. Цены и наличие
Цены, указанные на сайте, могут носить ориентировочный характер и не являются окончательным коммерческим предложением.
Цена может изменяться в зависимости от наличия товара, количества, валютного курса, расходов на доставку и таможенное оформление, условий на объекте, дополнительных материалов и услуг, налогов и обязательных платежей.
Заказ считается принятым только после письменного подтверждения Solarix и оформления соответствующего договора, счёта или иного документа.

5. Заказы и оплата
При направлении заказа или запроса пользователь обязан предоставить полную и достоверную информацию.
Solarix вправе отклонить или отменить заказ, если товар отсутствует, в цене или технической информации допущена очевидная ошибка, оплата не подтверждена, сделка противоречит законодательству или клиент предоставил ложные или неполные сведения.
Условия оплаты, размер аванса и сроки платежа указываются в коммерческом предложении, счёте или договоре.

6. Доставка и монтаж
Сроки доставки и монтажа могут быть ориентировочными. Задержки возможны вследствие логистических и таможенных процедур, производства, погодных условий, получения государственных разрешений, подключения к сети и других обстоятельств, находящихся вне разумного контроля Solarix.
Точный объём работ, сроки, распределение ответственности и порядок приёмки определяются отдельным договором.

7. Гарантия
Гарантийные условия определяются гарантией производителя и договором, заключённым с Solarix.
Гарантия может не распространяться на неправильную эксплуатацию, несанкционированное вмешательство или ремонт, неправильный монтаж, механические повреждения, отклонения напряжения электросети, стихийные бедствия и форс-мажор, несоблюдение инструкций производителя.

8. Возврат и обмен
Возврат и обмен товаров осуществляются в соответствии с законодательством Азербайджанской Республики, состоянием товара, требованиями производителя и договором между сторонами.
Товары, привезённые под индивидуальный заказ, бывшие в употреблении, установленные, повреждённые или подготовленные для конкретного проекта, могут не подлежать возврату в пределах, разрешённых законом.

9. Интеллектуальная собственность
Тексты, дизайн, логотипы, фотографии, графические материалы, каталоги, технические документы и иное содержимое сайта принадлежат Solarix или соответствующим правообладателям.
Копирование, изменение, распространение, продажа и коммерческое использование материалов без предварительного письменного разрешения запрещены.

10. Ссылки на сторонние ресурсы
Сайт может содержать ссылки на сайты производителей, партнёров и иных третьих лиц.
Solarix не несёт ответственности за содержание, безопасность, политику конфиденциальности и работу сторонних сайтов.

11. Ограничение ответственности
В пределах, разрешённых законодательством, Solarix не гарантирует непрерывную и безошибочную работу сайта, не отвечает за технические или финансовые решения, принятые исключительно на основании общей информации с сайта, и не несёт ответственности за косвенные убытки, упущенную прибыль или потерю данных.
Настоящие положения не ограничивают обязательные права потребителей, установленные законом.

12. Персональные данные
Персональные данные, предоставленные через сайт, обрабатываются в соответствии с законодательством и Политикой конфиденциальности volt.az.
Пользователь должен предоставлять только собственные данные либо сведения, на передачу которых он имеет законное право.

13. Изменение условий
Solarix вправе обновлять настоящие Условия в связи с изменением законодательства, услуг или работы сайта.
Новая редакция вступает в силу с момента её публикации на сайте.

14. Применимое право и споры
Настоящие Условия регулируются законодательством Азербайджанской Республики.
Споры должны в первую очередь разрешаться путём добросовестных переговоров. При невозможности достижения соглашения спор передаётся на рассмотрение компетентного суда Азербайджанской Республики.

15. Контактная информация
Solarix / volt.az
Адрес: г. Баку, ул. Ковкаб Сафарлиевой, 16E, Time Business Center, 6-й этаж
Телефон: +994 50 418 00 01
Электронная почта: support@volt.az
Сайт: www.volt.az`,
  tr: `Kullanım Koşulları
Son güncelleme tarihi: 9 Haziran 2026

Bu Kullanım Koşulları, volt.az internet sitesine erişimi ve sitenin kullanımını düzenler. Siteye erişerek veya siteyi kullanarak bu Koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylamış olursunuz.

1. Genel hükümler
volt.az, Solarix tarafından sunulan güneş enerjisi ekipmanları, teknik çözümler, projelendirme, tedarik, kurulum ve ilgili hizmetler için bir bilgilendirme platformu ve resmî satış kanalıdır.
Sitede yayımlanan bilgiler genel bilgilendirme amaçlıdır. Ürün seçimi, teknik hesaplamalar, proje fiyatlandırması ve kurulum koşulları, teknik değerlendirme ve resmî ticari teklif sonrasında ayrıca belirlenir.

2. Sitenin kullanımı
Site yalnızca yasal amaçlarla kullanılabilir.
Aşağıdaki işlemler yasaktır: sitenin çalışmasına veya güvenliğine müdahale etmek, virüs veya zararlı kod iletmek, yetkisiz erişim sağlamaya çalışmak, yanlış veya yetkisiz üçüncü kişi bilgileri sunmak, site içeriğini yasa dışı ticari amaçlarla kullanmak, telif hakkı veya diğer fikrî mülkiyet haklarını ihlal etmek.

3. Ürünler ve teknik bilgiler
Ürün görselleri, teknik özellikler, ölçüler, verimlilik değerleri, garanti bilgileri ve diğer açıklamalar üreticiler tarafından sağlanan bilgilere dayanabilir.
Solarix, bilgilerin doğru ve güncel olması için makul çaba gösterir. Ancak üreticiler ürün tasarımını, teknik özellikleri, ambalajı veya ürün içeriğini önceden bildirimde bulunmadan değiştirebilir.
Bir ürünün belirli bir projeye uygunluğu, Solarix uzmanları tarafından ayrıca teknik değerlendirmeye tabi tutulabilir.

4. Fiyatlar ve stok durumu
Sitede yer alan fiyatlar bilgilendirme amaçlı olabilir ve kesin ticari teklif niteliği taşımayabilir.
Fiyatlar stok durumu, sipariş miktarı, döviz kurları, nakliye ve gümrük masrafları, kurulum alanının koşulları, ek malzeme ve hizmetler, vergiler ve yasal ödemelere bağlı olarak değişebilir.
Sipariş, yalnızca Solarix tarafından yazılı olarak onaylandıktan ve ilgili sözleşme, fatura veya sipariş belgesi düzenlendikten sonra kabul edilmiş sayılır.

5. Sipariş ve ödeme
Kullanıcı, sipariş veya bilgi talebi gönderirken doğru ve eksiksiz bilgi vermelidir.
Solarix; ürünün stokta bulunmaması, fiyat veya teknik bilgilerde açık hata bulunması, ödemenin onaylanmaması, işlemin yürürlükteki mevzuata aykırı olması veya müşterinin yanlış ya da eksik bilgi vermesi halinde siparişi reddedebilir veya iptal edebilir.
Ödeme koşulları, avans tutarı ve ödeme tarihleri ilgili teklif, fatura veya sözleşmede belirtilir.

6. Teslimat ve kurulum
Teslimat ve kurulum tarihleri tahmini olabilir. Lojistik, gümrük, üretim, hava koşulları, resmî izinler, şebeke bağlantı işlemleri veya Solarix'in makul kontrolü dışındaki diğer nedenlerle gecikmeler yaşanabilir.
Kurulumun kapsamı, süresi, tarafların sorumlulukları ve kabul prosedürü ayrı bir sözleşmeyle belirlenir.

7. Garanti
Ürünlere uygulanan garanti, üreticinin garanti şartlarına ve Solarix ile imzalanan sözleşmeye göre belirlenir.
Garanti hatalı kullanım, yetkisiz müdahale veya onarım, yanlış kurulum, mekanik hasar, şebeke gerilimindeki olağan dışı değişiklikler, doğal afet veya mücbir sebep, üretici talimatlarına uyulmaması gibi durumları kapsamayabilir.

8. İade ve değişim
İade ve değişim işlemleri Azerbaycan Cumhuriyeti mevzuatına, ürünün durumuna, üretici şartlarına ve taraflar arasındaki sözleşmeye uygun olarak gerçekleştirilir.
Özel siparişle getirilen, kullanılmış, kurulmuş, hasar görmüş veya belirli bir proje için hazırlanmış ürünler, kanunun izin verdiği ölçüde iade edilemeyebilir.

9. Fikrî mülkiyet
Sitedeki metinler, tasarımlar, logolar, fotoğraflar, grafikler, kataloglar, teknik belgeler ve diğer içerikler Solarix'e veya ilgili hak sahiplerine aittir.
Önceden yazılı izin alınmadan bu materyallerin kopyalanması, değiştirilmesi, dağıtılması, satılması veya ticari amaçla kullanılması yasaktır.

10. Üçüncü taraf bağlantıları
Site, üreticilere, iş ortaklarına ve diğer üçüncü taraflara ait internet sitelerine bağlantılar içerebilir.
Solarix, üçüncü taraf sitelerinin içeriğinden, güvenliğinden, gizlilik uygulamalarından veya çalışmasından sorumlu değildir.

11. Sorumluluğun sınırlandırılması
Yürürlükteki mevzuatın izin verdiği ölçüde Solarix sitenin kesintisiz veya hatasız çalışacağını garanti etmez, yalnızca sitedeki genel bilgilere dayanılarak alınan teknik veya mali kararlardan sorumlu değildir ve dolaylı zarar, kâr kaybı veya veri kaybından sorumlu değildir.
Bu hükümler, tüketicilerin kanunla güvence altına alınmış zorunlu haklarını sınırlandırmaz.

12. Kişisel veriler
Site üzerinden sunulan kişisel veriler, yürürlükteki mevzuata ve volt.az Gizlilik Politikasına uygun şekilde işlenir.
Kullanıcı yalnızca kendisine ait olan veya paylaşmaya yasal olarak yetkili olduğu bilgileri sunmalıdır.

13. Koşulların değiştirilmesi
Solarix, mevzuat, hizmetler veya sitenin işleyişindeki değişiklikleri yansıtmak amacıyla bu Koşulları güncelleyebilir.
Güncellenen Koşullar sitede yayımlandığı tarihte yürürlüğe girer.

14. Uygulanacak hukuk ve uyuşmazlıklar
Bu Koşullar Azerbaycan Cumhuriyeti kanunlarına tabidir.
Uyuşmazlıklar öncelikle iyi niyetli görüşmeler yoluyla çözülmelidir. Anlaşmaya varılamaması hâlinde uyuşmazlık, Azerbaycan Cumhuriyeti'nin yetkili mahkemelerine sunulur.

15. İletişim bilgileri
Solarix / volt.az
Adres: Bakü, Kövkeb Seferaliyeva Caddesi 16E, Time Business Center, 6. kat
Telefon: +994 50 418 00 01
E-posta: support@volt.az
İnternet sitesi: www.volt.az`
};

const labels = {
  back: { az: 'Geri qayıt', en: 'Back', ru: 'Назад', tr: 'Geri' },
  updated: {
    az: 'Bu mətn mövcud istifadə şərtləri PDF sənədlərindən hazırlanmışdır.',
    en: 'This page was prepared from the existing Terms of Use PDF documents.',
    ru: 'Эта страница подготовлена на основе существующих PDF документов условий использования.',
    tr: 'Bu sayfa mevcut Kullanım Koşulları PDF belgelerinden hazırlanmıştır.'
  }
};

const TermsOfService: React.FC<TermsOfServiceProps> = ({ lang = 'az', onBack }) => {
  const text = termsText[lang] || termsText.az;
  const [title, updated, ...body] = text.split('\n').filter((line) => line.trim());

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {labels.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{title}</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{title}</h1>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-10">{updated}</p>

        <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
          {body.map((line, index) => {
            const isHeading = /^\d+\.\s/.test(line);
            return isHeading ? (
              <h2 key={index} className="pt-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                {line}
              </h2>
            ) : (
              <p key={index} className="whitespace-pre-line">{line}</p>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
          <p className="text-slate-400 text-xs italic">{labels.updated[lang]}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
