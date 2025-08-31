import axios from "axios";

export interface CircleMember {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface CircleMessage {
  member_id: string;
  body: string;
}

const CIRCLE_API_BASE_URL = "https://app.circle.so/api/admin/v2";
const CIRCLE_API_TOKEN = process.env.CIRCLE_API_TOKEN!;

export const getCircleHeaders = () => {
  return {
    Authorization: `Bearer ${CIRCLE_API_TOKEN}`,
    "Content-Type": "application/json",
  };
};

export const verifyCircleMemberByEmail = async (
  email: string
): Promise<CircleMember | null> => {
  try {
    const response = await axios.get(
      `${CIRCLE_API_BASE_URL}/community_members/search/?query=${encodeURIComponent(
        email
      )}`,
      {
        headers: getCircleHeaders(),
      }
    );

    if (response.data.data && response.data.data.length > 0) {
      const member = response.data.data[0];
      // const member =  response.data?.community_members?.[0] ?? null; // use this if the first one doesn't work
      return {
        id: member.id,
        email: member.email,
        name: member.name,
        avatar_url: member.avatar_url,
      };
    }

    return null;
  } catch (error) {
    console.error("Error verifying member by email:", error);
    return null;
  }
};

export const sendCircleDirectMessage = async (
  message: CircleMessage
): Promise<boolean> => {
  try {
    await axios.post(
      `${CIRCLE_API_BASE_URL}/messages`,
      {
        member_id: message.member_id,
        body: message.body,
      },
      {
        headers: getCircleHeaders(),
      }
    );

    return true;
  } catch (error) {
    console.error("Error sending direct message:", error);
    return false;
  }
};
