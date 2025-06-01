# Hướng dẫn chạy project

Lưu ý: Hãy chạy theo từng bước từ trên xuống.

1.Cài đặt các môi trường Java 21, NodeJS, MySQL.

2.Điều chỉnh các thông tin về cơ sở dữ liệu phù hợp với máy bạn

    Bên trong file application.yml (nằm trong BackEnd/engvol/src/main/resources) bao gồm các thông tin về để kết nối với cơ sở dữ liệu. Hãy sửa lại các thông tin như username, password theo cở sở dữ liệu máy bạn

3.Tạo Schema flash_learn trong MySQL với lệnh

    CREATE SCHEMA flash_learn;

4.Compile BackEnd:

    - Tìm file pom.xml (nằm trong thư mục BackEnd/engvol)
    - Mở terminal từ file pom.xml (nếu dùng vscode thì nhấn chuột phải vào pom.xml và nhấn vào mục open in integrated terminal)
    - Chạy lệnh mvn clean install

5.Tạo các quyền trong cơ sở dữ liệu

    USE flash_learn;
    INSERT INTO flash_learn.role values (1,NULL,"ADMIN");
    INSERT INTO flash_learn.role values (2,NULL,"MEMBER");
    INSERT INTO flash_learn.role_class values (1,NULL,"ADMIN");
    INSERT INTO flash_learn.role_class values (2,NULL,"MEMBER");

6.Tạo 1 tài khoản admin giúp truy cập được trang quản lý hệ thống

    USE flash_learn;
    INSERT INTO flash_learn.users values (4, '123', '2025-05-13 10:42:26', 'admin@gmail.com', 'admin',  '$2a$10$LO4/UoH/b3jVOSY833KvG.MngmZH3KltGBN12xN6Ekpx25xNIhv8C', 1, 'admin', 1)

7.Khởi tạo server BackEnd

    - Tìm file pom.xml (nằm trong thư mục BackEnd/engvol)
    - Mở terminal từ file pom.xml (nếu dùng vscode thì nhấn chuột phải vào pom.xml và nhấn vào mục open in integrated terminal)
    - Chạy lệnh mvn spring-boot:run

8.Compile FrontEnd:

    - Tìm file package.json(nằm trong thư mục eng-vol)
    - Mở terminal từ file package.json (nếu dùng vscode thì nhấn chuột phải vào package.json và nhấn vào mục open in integrated terminal)
    - Chạy lệnh npm install

9.Khởi tạo server FrontEnd

    - Tìm file package.json(nằm trong thư mục eng-vol)
    - Mở terminal từ file package.json (nếu dùng vscode thì nhấn chuột phải vào package.json và nhấn vào mục open in integrated terminal)
    - Chạy lệnh npm run dev

10.Truy cập web theo đường dẫn http://localhost:5173

    Nếu cần đăng nhập thì hãy dùng tài khoản admin đã tạo bên trên để trải nghiệm mọi chức năng,
    Tên đăng nhập: admin
    Mật khẩu: 123123
