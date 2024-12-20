# import tweepy
# import openai
# import random
# import schedule
# import time
# import matplotlib.pyplot as plt



# # Set up Twitter API keys
# # API_KEY = 'your_twitter_api_key'
# # API_SECRET_KEY = 'your_twitter_api_secret_key'
# # ACCESS_TOKEN = 'your_twitter_access_token'
# # ACCESS_TOKEN_SECRET = 'your_twitter_access_token_secret'

# # Authenticate to Twitter
# auth = tweepy.OAuthHandler(API_KEY, API_SECRET_KEY)
# auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
# api = tweepy.API(auth)

# # Function to generate content using GPT-3
# def generate_tech_content():
#     topics = ['AI', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'IoT', 'Tech Innovations']
#     prompt = f"Write a tweet about {random.choice(topics)} that is engaging and informative for a tech audience."
    
#     response = openai.Completion.create(
#         engine="text-davinci-003",  # Use GPT-3 model
#         prompt=prompt,
#         max_tokens=100,
#         temperature=0.7
#     )
    
#     tweet = response.choices[0].text.strip()
#     return tweet

# # Function to post a tweet with an image or chart
# def post_tweet_with_media(tweet, image_path=None, chart=None):
#     media_ids = []

#     if image_path:
#         media = api.media_upload(image_path)
#         media_ids.append(media.media_id_string)
    
#     if chart:
#         # Save chart as an image
#         chart_image = 'chart.png'
#         chart.save(chart_image)
#         media = api.media_upload(chart_image)
#         media_ids.append(media.media_id_string)

#     api.update_status(status=tweet, media_ids=media_ids)

# # Function to create a chart (for example, a bar chart)
# def create_chart():
#     x = ['AI', 'Blockchain', 'Cybersecurity', 'Cloud']
#     y = [90, 75, 85, 80]
    
#     plt.bar(x, y)
#     plt.xlabel('Tech Trends')
#     plt.ylabel('Engagement %')
#     plt.title('Tech Trend Engagement')
    
#     return plt

# # Function to create a poll
# def create_poll():
#     question = "Which tech trend excites you the most?"
#     options = ["AI", "Blockchain", "Cybersecurity", "Cloud Computing"]
#     poll_duration = 1440  # Poll duration in minutes (1 day)

#     return question, options, poll_duration

# # Function to post a tweet with a poll
# def post_poll():
#     question, options, poll_duration = create_poll()
#     status = f"Vote now! {question}"
#     api.update_status(status=status, poll_choices=options, poll_duration_minutes=poll_duration)

# # Main function to run the bot
# def post_automatically():
#     # Generate tech content using GPT-3
#     tweet = generate_tech_content()

#     # Decide randomly whether to include an image, chart, or poll
#     choice = random.choice(['image', 'chart', 'poll'])

#     if choice == 'image':
#         image_path = 'path_to_your_image.jpg'  # Add path to your image
#         post_tweet_with_media(tweet, image_path=image_path)

#     elif choice == 'chart':
#         chart = create_chart()
#         post_tweet_with_media(tweet, chart=chart)

#     elif choice == 'poll':
#         post_poll()

# # Schedule the bot to post every hour
# schedule.every(1).hour.do(post_automatically)

# # Run the bot
# while True:
#     schedule.run_pending()
#     time.sleep(60)  # Wait for 1 minute before checking for next scheduled task
