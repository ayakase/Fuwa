
import { createI18n } from 'vue-i18n';
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies()
let savedLang = cookies.get('lang')
if (savedLang && savedLang !== undefined) {
    console.log(savedLang)
} else {
    cookies.set('lang', 'en')
    savedLang = 'en'
}
const language = createI18n({
    // legacy: false, 
    locale: savedLang || 'en',
    fallbackLocale: 'en',
    messages: {
        en: {
            display_name: 'Display Name',
            connection_id: 'Connection Id',
            about_me: 'About Me',
            save: 'Save',
            cancel: 'Cancel',
            change_avatar: "Change Avatar",
            sign_out: "Sign Out",
            primary_color: "Primary Color",
            color_theme: "Color Theme",
            background_theme: "Background Theme",
            system_setting: "System Settings",
            profile_setting: "Profile Settings",
            explore: "Explore",
            home: "Home",
            groups: "Groups",
            inbox: "Inbox",
            settings: "Settings",
            invite_link: "Invite Link",
            members_list: "Members",
            images_grid: "Images",
            load_more_msg: "Load More Message",
            no_box: "No group selected, select or join a group to begin conversation",
            explore_title: "Explore what people are talking about",
            search_placeholder: "Search",
            new_chat_title: "Create new chat group",
            new_box_name: "New box name",
            new_box_invite_id: "Invite Id",
            random_id: "Random Id",
            new_box_description: "New box description",
            select_thumbnail: "Select thumbnail",
            select_banner: "Select banner",
            new_chat_btn: "Create",
            language_setting: "Language",
            image_upload: "Drag & Drop or click to upload",
            theme_toast: "Theme changed to ",
            greeting: "Greeting",
            message_placeholder: "{'@'}bot to ask bot, arrow key ⌃ or ⌄ to navigate between messages",
            join: 'Join chat',
            joined: 'Joined',
            exit: 'Exit',
            member_count: "members",
            create: 'create',
            reload: "reload",
            pin: 'Pin to top',
            delete: "Delete group",
            leave: "Leave group",
            change: "Change",
            cfcolor: "Confirm color change"
        },
        ja: {
            display_name: '表示名',
            connection_id: '接続ID',
            about_me: '私について',
            save: '保存',
            cancel: 'キャンセル',
            change_avatar: "アバターを変更",
            sign_out: "サインアウト",
            primary_color: "主要な色",
            color_theme: "カラーテーマ",
            background_theme: "背景テーマ",
            system_setting: "システム設定",
            profile_setting: "プロフィール設定",
            explore: "探検",
            home: "ホーム",
            groups: "グループ",
            inbox: "受信トレイ",
            settings: "設定",
            invite_link: "招待リンク",
            members_list: "メンバー",
            images_grid: "画像",
            load_more_msg: "さらにメッセージを読み込む",
            no_box: "グループが選択されていません。会話を始めるにはグループを選択または参加してください。",
            explore_title: "人々が話していることを探る",
            search_placeholder: "検索",
            new_chat_title: "新しいチャットグループを作成",
            new_box_name: "新しいボックス名",
            new_box_invite_id: "招待ID",
            random_id: "ランダムID",
            new_box_description: "新しいボックスの説明",
            select_thumbnail: "サムネイルを選択",
            select_banner: "バナーを選択",
            new_chat_btn: "作成",
            language_setting: "言語",
            image_upload: "ドラッグ＆ドロップまたはクリックしてアップロード",
            theme_toast: "テーマが変更されました ",
            greeting: "挨拶",
            message_placeholder: "{'@'}botに質問するには、矢印キー⌃または⌄でメッセージ間を移動",
            join: 'チャットに参加',
            joined: '参加済み',
            exit: '退出',
            member_count: "メンバー",
            create: '作成',
            reload: 'リロード',
            pin: 'トップに固定',
            delete: 'グループを削除',
            leave: 'グループを離れる',
            change: '変更',
            cfcolor: '色の変更を確認',

        },
        vi: {
            display_name: 'Tên hiển thị',
            connection_id: 'ID kết nối',
            about_me: 'Về tôi',
            save: 'Lưu',
            cancel: 'Hủy',
            change_avatar: "Thay đổi ảnh đại diện",
            sign_out: "Đăng xuất",
            primary_color: "Màu chính",
            color_theme: "Chủ đề màu sắc",
            background_theme: "Chủ đề nền",
            system_setting: "Cài đặt hệ thống",
            profile_setting: "Cài đặt hồ sơ",
            explore: "Khám phá",
            home: "Trang chủ",
            groups: "Nhóm",
            inbox: "Hộp thư đến",
            settings: "Cài đặt",
            invite_link: "Liên kết mời",
            members_list: "Thành viên",
            images_grid: "Hình ảnh",
            load_more_msg: "Tải thêm tin nhắn",
            no_box: "Không có nhóm nào được chọn, hãy chọn hoặc tham gia một nhóm để bắt đầu trò chuyện",
            explore_title: "Khám phá những gì mọi người đang nói về",
            search_placeholder: "Tìm kiếm",
            new_chat_title: "Tạo nhóm trò chuyện mới",
            new_box_name: "Tên hộp mới",
            new_box_invite_id: "ID mời",
            random_id: "ID ngẫu nhiên",
            new_box_description: "Mô tả hộp mới",
            select_thumbnail: "Chọn hình thu nhỏ",
            select_banner: "Chọn biểu ngữ",
            new_chat_btn: "Tạo",
            language_setting: "Ngôn ngữ",
            image_upload: "Kéo và thả hoặc nhấp để tải lên",
            theme_toast: "Chủ đề đã được thay đổi thành ",
            greeting: "Lời chào",
            message_placeholder: "{'@'}bot để hỏi bot, phím mũi tên ⌃ hoặc ⌄ để điều hướng giữa các tin nhắn",
            join: 'Tham gia trò chuyện',
            joined: 'Đã tham gia',
            exit: 'Thoát',
            member_count: "thành viên",
            create: 'tạo',
            reload: 'tải lại',
            pin: 'Ghim lên đầu',
            delete: 'Xóa nhóm',
            leave: 'Rời nhóm',
            change: 'Thay đổi',
            cfcolor: 'Xác nhận',

        }
    }
});

export default language