<script setup>
  import { computed } from 'vue';
  import { formatDistanceToNow } from 'date-fns';

  const props = defineProps({
    notification: {
      type: Object,
      required: true
    }
  });
  const emit = defineEmits(['notifyParent']);

  const getIconSrc = (type) => {
      if (type === 'CLASS_JOIN_REQUEST' || type === 'REJECTED_CLASS_JOIN_REQUEST' || type === 'ACCEPTED_CLASS_JOIN_REQUEST') {
      return new URL('@/assets/join_class_icon.svg', import.meta.url).href;
    } else if (type === 'CLASS_INVITATION' || type === 'REJECTED_CLASS_INVITATION' || type === 'ACCEPTED_CLASS_INVITATION') {
      return new URL('@/assets/invite.svg', import.meta.url).href;
    } else if (type === 'CLASS_SET_REJECT') {
      return new URL('@/assets/set_rejected.svg', import.meta.url).href;
    } else if(type === "CLASS_SET_ACCEPT") {
      return new URL('@/assets/set_accepted.svg', import.meta.url).href;
    } else if(type === "CLASS_SET_REQUEST") {
      return new URL('@/assets/set_request.svg', import.meta.url).href;
    }else {
      return new URL('@/assets/review_icon.svg', import.meta.url).href;
    }
  };

 
  
  const formattedDate = computed(() => {
    return formatDistanceToNow(new Date(props.notification.createdAt), { addSuffix: true });
  });
 
</script>
<template>
  <div class="notification-item" :class="{ 'read': notification.isRead }" >
    <div class="icon">
      <img :src="getIconSrc(notification.type)" alt="icon" />
    </div>
    <div class="content">
      <p class="message">{{ notification.message }}</p>
      <span class="metadata">{{ formattedDate }}</span>
    </div>
  </div>
</template>
  
<style scoped>
  .notification-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    background-color: #f8f9fa;
    margin-bottom: 10px;
    transition: opacity 0.3s ease, background-color 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .notification-item.read {
    opacity: 0.5;
    background-color: #f8f9fa;
  }

  .notification-item:hover {
    background-color: #f1f1f1; 
  }

  .icon img {
    width: 40px;
    /* height: 24px; */
    margin-right: 10px;
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .message {
    font-size: 14px;
    font-weight: bold;
    margin: 0;
  }

  .metadata {
    font-size: 12px;
    color: #6c757d;
  }
  
</style>